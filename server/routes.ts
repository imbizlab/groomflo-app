import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBusinessSchema, insertPostSchema } from "@shared/schema";
import { generateWeeklyPosts } from "./services/content-generator";
import { generateWeeklySchedule } from "./services/post-scheduler";
import { facebookPoster } from "./services/facebook-poster";
import { emailNotificationWorker } from "./services/email-notification-worker";
import { z } from "zod";
import bcrypt from "bcryptjs";

const accountCreationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  businessName: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  notificationEmail: z.string().email().optional(),
});

const verifyMembershipSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateSubscriptionSchema = z.object({
  email: z.string().email(),
  subscriptionStatus: z.enum(["active", "expired", "cancelled", "trial"]),
  subscriptionStartDate: z.string().datetime(),
  subscriptionEndDate: z.string().datetime(),
});

function verifyApiKey(req: any, res: any, next: any) {
  const apiKey = req.headers["x-api-key"] || req.headers["authorization"]?.replace("Bearer ", "");
  
  if (!process.env.API_KEY) {
    return res.status(500).json({ error: "API key not configured on server" });
  }
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Invalid API key" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByUsername(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Store userId in session for persistent authentication
      req.session.userId = user.id;
      
      // Also set user in request for immediate use
      req.user = {
        id: user.id,
        username: user.username,
      };

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.username,
        },
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // User registration endpoint  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existingUser = await storage.getUserByUsername(email);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username: email,
        password: hashedPassword,
      });

      // Automatically log in the user after registration
      req.session.userId = user.id;
      req.user = {
        id: user.id,
        username: user.username,
      };

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.username,
        },
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // User logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Check auth status
  app.get("/api/auth/me", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({
      user: {
        id: req.user.id,
        email: req.user.username,
      },
    });
  });
  
  app.post("/api/accounts/create", verifyApiKey, async (req, res) => {
    try {
      const validatedData = accountCreationSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const now = new Date();
      const oneMonthLater = new Date(now);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      
      const user = await storage.createUser({
        username: validatedData.email,
        password: hashedPassword,
        subscriptionStatus: "active",
        subscriptionStartDate: now,
        subscriptionEndDate: oneMonthLater,
      });

      const business = await storage.createBusiness({
        userId: user.id,
        businessName: validatedData.businessName,
        address: validatedData.address || null,
        phone: validatedData.phone || null,
        email: validatedData.email,
        website: validatedData.website || null,
        hours: null,
        slowestDay: "monday",
        facebookPageId: null,
        facebookAccessToken: null,
        instagramAccountId: null,
        customPromptInformative: null,
        customPromptFunFact: null,
        customPromptPromotional: null,
        notificationEmail: validatedData.notificationEmail || validatedData.email,
        dailyEmailNotifications: true,
        isOnboarded: false,
      });

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.username,
        },
        business: {
          id: business.id,
          businessName: business.businessName,
        },
        message: "Account created successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error creating account:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/verify-membership", verifyApiKey, async (req, res) => {
    try {
      const validatedData = verifyMembershipSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.email);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: "Invalid credentials" 
        });
      }

      const passwordMatch = await bcrypt.compare(validatedData.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false,
          error: "Invalid credentials" 
        });
      }

      const now = new Date();
      const hasEndDate = user.subscriptionEndDate !== null && user.subscriptionEndDate !== undefined;
      const isExpired = hasEndDate && new Date(user.subscriptionEndDate!) < now;
      const isActive = user.subscriptionStatus === "active" && hasEndDate && !isExpired;

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.username,
        },
        subscription: {
          status: isExpired ? "expired" : user.subscriptionStatus,
          isActive: isActive,
          startDate: user.subscriptionStartDate,
          endDate: user.subscriptionEndDate,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error verifying membership:", error);
      res.status(500).json({ error: "Failed to verify membership" });
    }
  });

  app.post("/api/auth/update-subscription", verifyApiKey, async (req, res) => {
    try {
      const validatedData = updateSubscriptionSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const updates: any = {
        subscriptionStatus: validatedData.subscriptionStatus,
        subscriptionStartDate: new Date(validatedData.subscriptionStartDate),
        subscriptionEndDate: new Date(validatedData.subscriptionEndDate),
      };

      const updatedUser = await storage.updateUser(user.id, updates);

      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user" });
      }

      res.json({
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.username,
        },
        subscription: {
          status: updatedUser.subscriptionStatus,
          startDate: updatedUser.subscriptionStartDate,
          endDate: updatedUser.subscriptionEndDate,
        },
        message: "Subscription updated successfully",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      console.error("Error updating subscription:", error);
      res.status(500).json({ error: "Failed to update subscription" });
    }
  });
  
  app.post("/api/businesses", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validatedData = insertBusinessSchema.parse(req.body);
      
      const business = await storage.createBusiness({
        ...validatedData,
        userId,
        isOnboarded: true,
      });

      res.json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating business:", error);
      res.status(500).json({ error: "Failed to create business" });
    }
  });

  app.get("/api/businesses/current", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ error: "Failed to fetch business" });
    }
  });

  app.patch("/api/businesses/:id", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const business = await storage.getBusiness(id);
      
      if (!business || business.userId !== userId) {
        return res.status(404).json({ error: "Business not found" });
      }

      const allowedUpdateSchema = insertBusinessSchema.partial().pick({
        businessName: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        hours: true,
        slowestDay: true,
        facebookPageId: true,
        facebookAccessToken: true,
        instagramAccountId: true,
        customPromptInformative: true,
        customPromptFunFact: true,
        customPromptPromotional: true,
        notificationEmail: true,
        dailyEmailNotifications: true,
      });
      
      const validatedData = allowedUpdateSchema.parse(req.body);
      const updatedBusiness = await storage.updateBusiness(id, validatedData);

      res.json(updatedBusiness);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating business:", error);
      res.status(500).json({ error: "Failed to update business" });
    }
  });

  app.post("/api/posts/generate-weekly", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      let weekStartDate = new Date();
      if (req.body.weekStartDate) {
        const dateSchema = z.string().datetime();
        const validatedDate = dateSchema.parse(req.body.weekStartDate);
        weekStartDate = new Date(validatedDate);
        
        if (isNaN(weekStartDate.getTime())) {
          return res.status(400).json({ error: "Invalid date format" });
        }
      }

      const schedule = generateWeeklySchedule(business, weekStartDate);
      
      const generatedPosts = await generateWeeklyPosts(business);
      
      const posts = await Promise.all(
        generatedPosts.map(async (post, index) => {
          return storage.createPost({
            businessId: business.id,
            postType: post.postType,
            content: post.content,
            imageUrl: post.imageUrl,
            status: "pending",
            scheduledFor: schedule[index].scheduledFor,
          });
        })
      );

      await storage.createPostSchedule({
        businessId: business.id,
        weekStarting: weekStartDate,
        isGenerated: true,
      });

      res.json(posts);
    } catch (error) {
      console.error("Error generating weekly posts:", error);
      res.status(500).json({ error: "Failed to generate weekly posts" });
    }
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      const posts = await storage.getPostsByBusinessId(business.id);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/pending", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      const posts = await storage.getPendingPostsByBusinessId(business.id);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching pending posts:", error);
      res.status(500).json({ error: "Failed to fetch pending posts" });
    }
  });

  app.get("/api/posts/scheduled", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      const posts = await storage.getScheduledPostsByBusinessId(business.id);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching scheduled posts:", error);
      res.status(500).json({ error: "Failed to fetch scheduled posts" });
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const business = await storage.getBusiness(post.businessId);
      if (!business || business.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const allowedUpdateSchema = insertPostSchema.partial().pick({
        postType: true,
        content: true,
        imageUrl: true,
        status: true,
        scheduledFor: true,
      });
      
      const validatedData = allowedUpdateSchema.parse(req.body);
      const updatedPost = await storage.updatePost(id, validatedData);

      res.json(updatedPost);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating post:", error);
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const business = await storage.getBusiness(post.businessId);
      if (!business || business.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await storage.deletePost(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  app.post("/api/posts/:id/publish-to-facebook", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const business = await storage.getBusiness(post.businessId);
      if (!business || business.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (post.status !== "approved") {
        return res.status(400).json({ error: "Post must be approved before publishing" });
      }

      const { facebookPostId } = await facebookPoster.postToFacebook(business, post);

      const updatedPost = await storage.updatePost(id, {
        status: "posted",
        postedAt: new Date(),
        facebookPostId,
      });

      res.json(updatedPost);
    } catch (error) {
      console.error("Error publishing to Facebook:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to publish to Facebook";
      res.status(500).json({ error: errorMessage });
    }
  });

  app.post("/api/facebook/validate-connection", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      if (!business.facebookPageId || !business.facebookAccessToken) {
        return res.status(400).json({ error: "Facebook credentials not configured" });
      }

      const isValid = await facebookPoster.validatePageAccess(
        business.facebookPageId,
        business.facebookAccessToken
      );

      res.json({ valid: isValid });
    } catch (error) {
      console.error("Error validating Facebook connection:", error);
      res.status(500).json({ error: "Failed to validate Facebook connection" });
    }
  });

  app.post("/api/posts/publish-scheduled", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      const now = new Date();
      const scheduledPosts = await storage.getScheduledPostsByBusinessId(business.id);
      
      const postsToPublish = scheduledPosts.filter(post => 
        post.status === "approved" && 
        post.scheduledFor && 
        new Date(post.scheduledFor) <= now
      );

      const results = await Promise.allSettled(
        postsToPublish.map(async (post) => {
          const { facebookPostId } = await facebookPoster.postToFacebook(business, post);
          
          await storage.updatePost(post.id, {
            status: "posted",
            postedAt: new Date(),
            facebookPostId,
          });

          return { postId: post.id, success: true };
        })
      );

      for (const result of results) {
        if (result.status === "rejected" && result.reason) {
          const postId = postsToPublish[results.indexOf(result)]?.id;
          if (postId) {
            await storage.updatePost(postId, {
              status: "failed",
            });
          }
        }
      }

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      res.json({
        total: postsToPublish.length,
        successful,
        failed,
        results: results.map((r, idx) => {
          if (r.status === "fulfilled") {
            return r.value;
          } else {
            return {
              postId: postsToPublish[idx]?.id,
              success: false,
              error: r.reason instanceof Error ? r.reason.message : "Unknown error"
            };
          }
        }),
      });
    } catch (error) {
      console.error("Error publishing scheduled posts:", error);
      res.status(500).json({ error: "Failed to publish scheduled posts" });
    }
  });

  app.post("/api/notifications/test", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const business = await storage.getBusinessByUserId(userId);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const emailSchema = z.string().email();
      const validatedEmail = emailSchema.parse(email);

      await emailNotificationWorker.sendTestNotification(business.id, validatedEmail);

      res.json({ success: true, message: "Test email sent successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid email address" });
      }
      console.error("Error sending test notification:", error);
      res.status(500).json({ error: "Failed to send test notification" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

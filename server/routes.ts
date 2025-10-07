import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBusinessSchema, insertPostSchema } from "@shared/schema";
import { generateWeeklyPosts } from "./services/content-generator";
import { generateWeeklySchedule } from "./services/post-scheduler";
import { facebookPoster } from "./services/facebook-poster";
import { emailNotificationWorker } from "./services/email-notification-worker";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
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

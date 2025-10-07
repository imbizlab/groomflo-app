import { storage } from "../storage";
import { EmailNotifier } from "./email-notifier";
import { startOfDay, endOfDay } from "date-fns";
import type { Post } from "@shared/schema";

export class EmailNotificationWorker {
  private intervalId: NodeJS.Timeout | null = null;
  private emailNotifier: EmailNotifier;

  constructor() {
    this.emailNotifier = new EmailNotifier();
  }

  start(intervalHours: number = 24) {
    if (this.intervalId) {
      console.log("Email notification worker is already running");
      return;
    }

    console.log(`Starting email notification worker (checking every ${intervalHours} hours)`);
    
    this.sendDailyNotifications();
    
    this.intervalId = setInterval(() => {
      this.sendDailyNotifications();
    }, intervalHours * 60 * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Email notification worker stopped");
    }
  }

  private async sendDailyNotifications() {
    try {
      console.log("Checking for daily email notifications to send...");

      if (!process.env.CLOSEGPT_SECRET_KEY) {
        console.log("Email notifications disabled: CLOSEGPT_SECRET_KEY not configured");
        return;
      }

      const businesses = await storage.getAllBusinesses();
      
      const today = new Date();
      const dayStart = startOfDay(today);
      const dayEnd = endOfDay(today);

      for (const business of businesses) {
        if (!business.dailyEmailNotifications) {
          continue;
        }

        const notificationEmail = business.notificationEmail || business.email;
        if (!notificationEmail) {
          console.log(`Skipping ${business.businessName}: No notification email configured`);
          continue;
        }

        try {
          const posts = await storage.getPostsByBusinessId(business.id);
          
          const todaysPosts = posts.filter((post: Post) => {
            if (!post.scheduledFor) return false;
            const scheduledDate = new Date(post.scheduledFor);
            return scheduledDate >= dayStart && scheduledDate <= dayEnd;
          });

          await this.emailNotifier.sendDailyNotification({
            to: notificationEmail,
            businessName: business.businessName,
            posts: todaysPosts,
            date: today,
          });

          console.log(`Sent daily notification to ${notificationEmail} for ${business.businessName} (${todaysPosts.length} posts)`);
        } catch (error) {
          console.error(`Failed to send notification for ${business.businessName}:`, error);
        }
      }

      console.log("Daily notification check complete");
    } catch (error) {
      console.error("Error in daily notifications worker:", error);
    }
  }

  async sendTestNotification(businessId: string, email: string) {
    try {
      const business = await storage.getBusiness(businessId);
      if (!business) {
        throw new Error("Business not found");
      }

      const posts = await storage.getPostsByBusinessId(businessId);
      const today = new Date();
      const dayStart = startOfDay(today);
      const dayEnd = endOfDay(today);

      const todaysPosts = posts.filter((post: Post) => {
        if (!post.scheduledFor) return false;
        const scheduledDate = new Date(post.scheduledFor);
        return scheduledDate >= dayStart && scheduledDate <= dayEnd;
      });

      await this.emailNotifier.sendDailyNotification({
        to: email,
        businessName: business.businessName,
        posts: todaysPosts.length > 0 ? todaysPosts : posts.slice(0, 3),
        date: today,
      });

      console.log(`Test notification sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send test notification:`, error);
      throw error;
    }
  }
}

export const emailNotificationWorker = new EmailNotificationWorker();

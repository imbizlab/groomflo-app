import { storage } from "../storage";
import { facebookPoster } from "./facebook-poster";

export class PostSchedulerWorker {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start(intervalMinutes: number = 5) {
    if (this.isRunning) {
      console.log("Post scheduler worker is already running");
      return;
    }

    this.isRunning = true;
    console.log(`Starting post scheduler worker (checking every ${intervalMinutes} minutes)`);

    this.intervalId = setInterval(async () => {
      await this.publishScheduledPosts();
    }, intervalMinutes * 60 * 1000);

    this.publishScheduledPosts();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log("Post scheduler worker stopped");
    }
  }

  private async publishScheduledPosts() {
    try {
      console.log("Checking for scheduled posts to publish...");

      const businesses = await this.getAllBusinesses();
      
      for (const business of businesses) {
        if (!business.facebookPageId || !business.facebookAccessToken) {
          continue;
        }

        const now = new Date();
        const scheduledPosts = await storage.getScheduledPostsByBusinessId(business.id);
        
        const postsToPublish = scheduledPosts.filter(post => 
          post.status === "approved" && 
          post.scheduledFor && 
          new Date(post.scheduledFor) <= now &&
          !post.postedAt
        );

        if (postsToPublish.length === 0) {
          continue;
        }

        console.log(`Publishing ${postsToPublish.length} posts for business ${business.businessName}`);

        for (const post of postsToPublish) {
          try {
            const { facebookPostId } = await facebookPoster.postToFacebook(business, post);
            
            await storage.updatePost(post.id, {
              status: "posted",
              postedAt: new Date(),
              facebookPostId,
            });

            console.log(`Successfully published post ${post.id} to Facebook`);
          } catch (error) {
            console.error(`Failed to publish post ${post.id}:`, error);
            
            await storage.updatePost(post.id, {
              status: "failed",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in post scheduler worker:", error);
    }
  }

  private async getAllBusinesses() {
    return storage.getAllBusinesses();
  }
}

export const postSchedulerWorker = new PostSchedulerWorker();

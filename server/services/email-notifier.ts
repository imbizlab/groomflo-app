import type { Post } from "@shared/schema";
import { format } from "date-fns";

interface EmailNotification {
  to: string;
  businessName: string;
  posts: Post[];
  date: Date;
}

export class EmailNotifier {
  private apiKey: string | null = null;
  private baseUrl = "https://api.close.com/api/v1";

  constructor() {
    this.apiKey = process.env.CLOSEGPT_SECRET_KEY || null;
  }

  private ensureConfigured(): void {
    if (!this.apiKey) {
      throw new Error("CLOSEGPT_SECRET_KEY environment variable is not configured. Email notifications are disabled.");
    }
  }

  async sendDailyNotification(notification: EmailNotification): Promise<void> {
    this.ensureConfigured();
    
    const { to, businessName, posts, date } = notification;

    const subject = `Daily Social Media Posts - ${format(date, "MMMM d, yyyy")}`;
    const bodyHtml = this.generateEmailHtml(businessName, posts, date);

    try {
      const leadId = await this.getOrCreateLead(to, businessName);

      const response = await fetch(`${this.baseUrl}/activity/email/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(`${this.apiKey}:`).toString("base64")}`,
        },
        body: JSON.stringify({
          lead_id: leadId,
          to: [to],
          subject,
          body_html: bodyHtml,
          status: "outbox",
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send email: ${response.status} ${error}`);
      }

      const result = await response.json();
      console.log(`Email notification sent to ${to} for ${businessName}:`, result.id);
    } catch (error) {
      console.error(`Failed to send email notification to ${to}:`, error);
      throw error;
    }
  }

  private async getOrCreateLead(email: string, businessName: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error("API key not configured");
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${this.apiKey}:`).toString("base64")}`;
      
      const searchResponse = await fetch(
        `${this.baseUrl}/lead/?query=email:${encodeURIComponent(email)}`,
        {
          headers: {
            "Authorization": authHeader,
          },
        }
      );

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json();
        if (searchResult.data && searchResult.data.length > 0) {
          return searchResult.data[0].id;
        }
      }

      const createResponse = await fetch(`${this.baseUrl}/lead/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader,
        },
        body: JSON.stringify({
          name: businessName,
          contacts: [{
            name: businessName,
            emails: [{ email, type: "office" }],
          }],
        }),
      });

      if (!createResponse.ok) {
        const error = await createResponse.text();
        throw new Error(`Failed to create lead: ${createResponse.status} ${error}`);
      }

      const lead = await createResponse.json();
      console.log(`Created lead for ${email}:`, lead.id);
      return lead.id;
    } catch (error) {
      console.error(`Failed to get or create lead for ${email}:`, error);
      throw error;
    }
  }

  private generateEmailHtml(businessName: string, posts: Post[], date: Date): string {
    let postListHtml: string;

    if (posts.length === 0) {
      postListHtml = `
        <div style="text-align: center; padding: 40px 20px; color: #666;">
          <p style="font-size: 16px; margin: 0;">No posts scheduled for this day.</p>
          <p style="font-size: 14px; margin: 10px 0 0 0; color: #999;">Generate weekly posts to see them here.</p>
        </div>
      `;
    } else {
      postListHtml = posts
        .sort((a, b) => {
          if (!a.scheduledFor || !b.scheduledFor) return 0;
          return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime();
        })
        .map(post => {
          const scheduledTime = post.scheduledFor 
            ? format(new Date(post.scheduledFor), "h:mm a")
            : "Not scheduled";
          
          const postTypeLabel = post.postType === "fun_fact" 
            ? "Fun Fact" 
            : post.postType.charAt(0).toUpperCase() + post.postType.slice(1);

          return `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #1976d2;">${postTypeLabel}</span>
                <span style="color: #666; font-size: 14px;">Scheduled: ${scheduledTime}</span>
              </div>
              ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" style="max-width: 100%; height: auto; border-radius: 4px; margin-bottom: 10px;">` : ""}
              <p style="margin: 10px 0; color: #333; line-height: 1.6;">${post.content}</p>
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                <span style="display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; 
                  ${post.status === "approved" ? "background-color: #4caf50; color: white;" : 
                    post.status === "posted" ? "background-color: #2196f3; color: white;" : 
                    "background-color: #ff9800; color: white;"}">
                  ${post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </span>
              </div>
            </div>
          `;
        })
        .join("");
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Daily Social Media Posts</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Daily Social Media Posts</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">${businessName}</p>
            </div>
            
            <div style="padding: 30px;">
              <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">
                Here are your scheduled social media posts for <strong>${format(date, "EEEE, MMMM d, yyyy")}</strong>:
              </p>
              
              ${postListHtml}
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
                <p style="color: #666; font-size: 14px; margin: 0;">
                  This is an automated notification from your Social Media Automation Platform.
                </p>
                <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">
                  Posts will be automatically published at their scheduled times if approved.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

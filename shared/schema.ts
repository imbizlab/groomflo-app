import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  subscriptionStatus: text("subscription_status").notNull().default("active"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
});

export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  businessName: text("business_name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  hours: text("hours"),
  slowestDay: text("slowest_day").notNull(),
  facebookPageId: text("facebook_page_id"),
  facebookAccessToken: text("facebook_access_token"),
  instagramAccountId: text("instagram_account_id"),
  customPromptInformative: text("custom_prompt_informative"),
  customPromptFunFact: text("custom_prompt_fun_fact"),
  customPromptPromotional: text("custom_prompt_promotional"),
  notificationEmail: text("notification_email"),
  dailyEmailNotifications: boolean("daily_email_notifications").default(true),
  isOnboarded: boolean("is_onboarded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull(),
  postType: text("post_type").notNull(), // 'informative', 'fun_fact', 'promotional'
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'posted', 'failed'
  scheduledFor: timestamp("scheduled_for"),
  postedAt: timestamp("posted_at"),
  facebookPostId: text("facebook_post_id"),
  instagramPostId: text("instagram_post_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const postSchedules = pgTable("post_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull(),
  weekStarting: timestamp("week_starting").notNull(),
  isGenerated: boolean("is_generated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  subscriptionStatus: true,
  subscriptionStartDate: true,
  subscriptionEndDate: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  postedAt: true,
  facebookPostId: true,
  instagramPostId: true,
});

export const insertPostScheduleSchema = createInsertSchema(postSchedules).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPostSchedule = z.infer<typeof insertPostScheduleSchema>;
export type PostSchedule = typeof postSchedules.$inferSelect;

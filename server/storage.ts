import { eq, desc, and, isNull, isNotNull } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  businesses,
  posts,
  postSchedules,
  type User,
  type InsertUser,
  type Business,
  type InsertBusiness,
  type Post,
  type InsertPost,
  type PostSchedule,
  type InsertPostSchedule,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getBusiness(id: string): Promise<Business | undefined>;
  getBusinessByUserId(userId: string): Promise<Business | undefined>;
  getAllBusinesses(): Promise<Business[]>;
  createBusiness(business: InsertBusiness & { userId: string }): Promise<Business>;
  updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  
  getPost(id: string): Promise<Post | undefined>;
  getPostsByBusinessId(businessId: string): Promise<Post[]>;
  getPendingPostsByBusinessId(businessId: string): Promise<Post[]>;
  getScheduledPostsByBusinessId(businessId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<void>;
  
  getPostSchedule(businessId: string, weekStarting: Date): Promise<PostSchedule | undefined>;
  createPostSchedule(schedule: InsertPostSchedule): Promise<PostSchedule>;
  updatePostSchedule(id: string, schedule: Partial<InsertPostSchedule>): Promise<PostSchedule | undefined>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getBusiness(id: string): Promise<Business | undefined> {
    const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
    return result[0];
  }

  async getBusinessByUserId(userId: string): Promise<Business | undefined> {
    const result = await db.select().from(businesses).where(eq(businesses.userId, userId)).limit(1);
    return result[0];
  }

  async getAllBusinesses(): Promise<Business[]> {
    return db.select().from(businesses);
  }

  async createBusiness(business: InsertBusiness & { userId: string }): Promise<Business> {
    const result = await db.insert(businesses).values(business).returning();
    return result[0];
  }

  async updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const result = await db.update(businesses).set(business).where(eq(businesses.id, id)).returning();
    return result[0];
  }

  async getPost(id: string): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }

  async getPostsByBusinessId(businessId: string): Promise<Post[]> {
    return db.select().from(posts).where(eq(posts.businessId, businessId)).orderBy(desc(posts.createdAt));
  }

  async getPendingPostsByBusinessId(businessId: string): Promise<Post[]> {
    return db.select().from(posts)
      .where(eq(posts.businessId, businessId))
      .orderBy(desc(posts.createdAt));
  }

  async getScheduledPostsByBusinessId(businessId: string): Promise<Post[]> {
    return db.select().from(posts)
      .where(eq(posts.businessId, businessId))
      .orderBy(posts.scheduledFor);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  async updatePost(id: string, post: Partial<Post>): Promise<Post | undefined> {
    const result = await db.update(posts).set(post).where(eq(posts.id, id)).returning();
    return result[0];
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  async getPostSchedule(businessId: string, weekStarting: Date): Promise<PostSchedule | undefined> {
    const result = await db.select().from(postSchedules)
      .where(eq(postSchedules.businessId, businessId))
      .limit(1);
    return result[0];
  }

  async createPostSchedule(schedule: InsertPostSchedule): Promise<PostSchedule> {
    const result = await db.insert(postSchedules).values(schedule).returning();
    return result[0];
  }

  async updatePostSchedule(id: string, schedule: Partial<InsertPostSchedule>): Promise<PostSchedule | undefined> {
    const result = await db.update(postSchedules).set(schedule).where(eq(postSchedules.id, id)).returning();
    return result[0];
  }
}

export const storage = new DbStorage();

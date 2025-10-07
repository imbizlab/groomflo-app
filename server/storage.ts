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
import { encryptToken, decryptToken } from "./utils/encryption";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
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
  private decryptBusinessToken(business: Business | undefined): Business | undefined {
    if (!business || !business.facebookAccessToken) {
      return business;
    }

    try {
      return {
        ...business,
        facebookAccessToken: decryptToken(business.facebookAccessToken),
      };
    } catch (error) {
      console.error(`Failed to decrypt Facebook token for business ${business.id}:`, error);
      return business;
    }
  }

  private encryptBusinessToken(business: InsertBusiness & { userId: string }): InsertBusiness & { userId: string };
  private encryptBusinessToken(business: Partial<InsertBusiness>): Partial<InsertBusiness>;
  private encryptBusinessToken(business: any): any {
    if (!business.facebookAccessToken) {
      return business;
    }

    try {
      return {
        ...business,
        facebookAccessToken: encryptToken(business.facebookAccessToken),
      };
    } catch (error) {
      console.error("Failed to encrypt Facebook token:", error);
      throw error;
    }
  }

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

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getBusiness(id: string): Promise<Business | undefined> {
    const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
    return this.decryptBusinessToken(result[0]);
  }

  async getBusinessByUserId(userId: string): Promise<Business | undefined> {
    const result = await db.select().from(businesses).where(eq(businesses.userId, userId)).limit(1);
    return this.decryptBusinessToken(result[0]);
  }

  async getAllBusinesses(): Promise<Business[]> {
    const results = await db.select().from(businesses);
    return results.map(business => this.decryptBusinessToken(business)!).filter(Boolean);
  }

  async createBusiness(business: InsertBusiness & { userId: string }): Promise<Business> {
    const encryptedBusiness = this.encryptBusinessToken(business);
    const result = await db.insert(businesses).values(encryptedBusiness).returning();
    return this.decryptBusinessToken(result[0])!;
  }

  async updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const encryptedBusiness = this.encryptBusinessToken(business);
    const result = await db.update(businesses).set(encryptedBusiness).where(eq(businesses.id, id)).returning();
    return this.decryptBusinessToken(result[0]);
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

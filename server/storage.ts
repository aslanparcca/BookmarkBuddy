import {
  users,
  articles,
  bulkJobs,
  apiUsage,
  userSettings,
  type User,
  type UpsertUser,
  type Article,
  type InsertArticle,
  type BulkJob,
  type InsertBulkJob,
  type UserSettings,
  type InsertUserSettings,
  type ApiUsage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Article operations
  createArticle(article: InsertArticle): Promise<Article>;
  getArticlesByUserId(userId: string, limit?: number, offset?: number): Promise<Article[]>;
  getArticleById(id: number, userId: string): Promise<Article | undefined>;
  updateArticle(id: number, userId: string, updates: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number, userId: string): Promise<boolean>;
  
  // Bulk job operations
  createBulkJob(job: InsertBulkJob): Promise<BulkJob>;
  getBulkJobsByUserId(userId: string): Promise<BulkJob[]>;
  updateBulkJob(id: number, userId: string, updates: Partial<InsertBulkJob>): Promise<BulkJob | undefined>;
  
  // User settings operations
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  
  // API usage tracking
  getApiUsage(userId: string, month: string): Promise<ApiUsage | undefined>;
  incrementApiUsage(userId: string, apiType: string, requestCount: number, tokenCount: number): Promise<void>;
  
  // Statistics
  getUserStats(userId: string): Promise<{
    totalArticles: number;
    totalWords: number;
    monthlyArticles: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Article operations
  async createArticle(article: InsertArticle): Promise<Article> {
    const [newArticle] = await db.insert(articles).values(article).returning();
    return newArticle;
  }

  async getArticlesByUserId(userId: string, limit = 20, offset = 0): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.userId, userId))
      .orderBy(desc(articles.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async getArticleById(id: number, userId: string): Promise<Article | undefined> {
    const [article] = await db
      .select()
      .from(articles)
      .where(and(eq(articles.id, id), eq(articles.userId, userId)));
    return article;
  }

  async updateArticle(id: number, userId: string, updates: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updatedArticle] = await db
      .update(articles)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(articles.id, id), eq(articles.userId, userId)))
      .returning();
    return updatedArticle;
  }

  async deleteArticle(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(articles)
      .where(and(eq(articles.id, id), eq(articles.userId, userId)));
    return result.rowCount > 0;
  }

  // Bulk job operations
  async createBulkJob(job: InsertBulkJob): Promise<BulkJob> {
    const [newJob] = await db.insert(bulkJobs).values(job).returning();
    return newJob;
  }

  async getBulkJobsByUserId(userId: string): Promise<BulkJob[]> {
    return await db
      .select()
      .from(bulkJobs)
      .where(eq(bulkJobs.userId, userId))
      .orderBy(desc(bulkJobs.createdAt));
  }

  async updateBulkJob(id: number, userId: string, updates: Partial<InsertBulkJob>): Promise<BulkJob | undefined> {
    const [updatedJob] = await db
      .update(bulkJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(bulkJobs.id, id), eq(bulkJobs.userId, userId)))
      .returning();
    return updatedJob;
  }

  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings;
  }

  async upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [upsertedSettings] = await db
      .insert(userSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upsertedSettings;
  }

  // API usage tracking
  async getApiUsage(userId: string, month: string): Promise<ApiUsage | undefined> {
    const [usage] = await db
      .select()
      .from(apiUsage)
      .where(and(eq(apiUsage.userId, userId), eq(apiUsage.month, month)));
    return usage;
  }

  async incrementApiUsage(userId: string, apiType: string, requestCount: number, tokenCount: number): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    await db
      .insert(apiUsage)
      .values({
        userId,
        apiType,
        requestCount,
        tokenCount,
        month: currentMonth,
      })
      .onConflictDoUpdate({
        target: [apiUsage.userId, apiUsage.apiType, apiUsage.month],
        set: {
          requestCount: sql`${apiUsage.requestCount} + ${requestCount}`,
          tokenCount: sql`${apiUsage.tokenCount} + ${tokenCount}`,
        },
      });
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    totalArticles: number;
    totalWords: number;
    monthlyArticles: number;
  }> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const monthStart = new Date(currentMonth + "-01");
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    const [totalStats] = await db
      .select({
        totalArticles: sql<number>`count(*)`,
        totalWords: sql<number>`coalesce(sum(${articles.wordCount}), 0)`,
      })
      .from(articles)
      .where(eq(articles.userId, userId));

    const [monthlyStats] = await db
      .select({
        monthlyArticles: sql<number>`count(*)`,
      })
      .from(articles)
      .where(
        and(
          eq(articles.userId, userId),
          sql`${articles.createdAt} >= ${monthStart}`,
          sql`${articles.createdAt} <= ${monthEnd}`
        )
      );

    return {
      totalArticles: totalStats.totalArticles,
      totalWords: totalStats.totalWords,
      monthlyArticles: monthlyStats.monthlyArticles,
    };
  }
}

export const storage = new DatabaseStorage();

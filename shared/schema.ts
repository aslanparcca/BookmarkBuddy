import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Articles table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content"),
  htmlContent: text("html_content"),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, published, archived
  category: varchar("category", { length: 100}),
  keywords: text("keywords").array(),
  wordCount: integer("word_count").default(0),
  readingTime: integer("reading_time").default(0),
  metaDescription: text("meta_description"),
  seoSettings: jsonb("seo_settings"),
  aiSettings: jsonb("ai_settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bulk jobs table for tracking bulk article creation
export const bulkJobs = pgTable("bulk_jobs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  fileName: varchar("file_name").notNull(),
  totalArticles: integer("total_articles").notNull(),
  completedArticles: integer("completed_articles").default(0),
  failedArticles: integer("failed_articles").default(0),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, processing, completed, failed
  settings: jsonb("settings"),
  results: jsonb("results"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API usage tracking
export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  apiType: varchar("api_type", { length: 50 }).notNull(), // gemini, wordpress
  requestCount: integer("request_count").default(0),
  tokenCount: integer("token_count").default(0),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  createdAt: timestamp("created_at").defaultNow(),
});

// User settings
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  geminiApiKey: text("gemini_api_key"),
  geminiModel: varchar("gemini_model", { length: 50 }).default("gemini-1.5-flash"),
  wordpressUrl: text("wordpress_url"),
  wordpressUsername: varchar("wordpress_username"),
  wordpressAppPassword: text("wordpress_app_password"),
  defaultLanguage: varchar("default_language", { length: 10 }).default("tr"),
  defaultWordCount: varchar("default_word_count", { length: 20 }).default("800-1200"),
  defaultTone: varchar("default_tone", { length: 20 }).default("professional"),
  autoPublish: boolean("auto_publish").default(false),
  includeSeo: boolean("include_seo").default(true),
  includeImages: boolean("include_images").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBulkJobSchema = createInsertSchema(bulkJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertBulkJob = z.infer<typeof insertBulkJobSchema>;
export type BulkJob = typeof bulkJobs.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type ApiUsage = typeof apiUsage.$inferSelect;

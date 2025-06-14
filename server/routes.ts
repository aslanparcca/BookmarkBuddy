import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertArticleSchema, insertUserSettingsSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import multer from "multer";
import * as XLSX from "xlsx";
import { z } from "zod";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Articles routes
  app.get('/api/articles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const articles = await storage.getArticlesByUserId(userId, limit, offset);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.post('/api/articles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const articleData = insertArticleSchema.parse({ ...req.body, userId });
      
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.put('/api/articles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const articleId = parseInt(req.params.id);
      const updates = req.body;
      
      const article = await storage.updateArticle(articleId, userId, updates);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete('/api/articles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const articleId = parseInt(req.params.id);
      
      const success = await storage.deleteArticle(articleId, userId);
      if (!success) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // AI content generation
  app.post('/api/generate-content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { titles, settings } = req.body;
      
      // Get user settings for API key
      const userSettings = await storage.getUserSettings(userId);
      if (!userSettings?.geminiApiKey) {
        return res.status(400).json({ message: "Gemini API key not configured" });
      }

      const genAI = new GoogleGenerativeAI(userSettings.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: userSettings.geminiModel || "gemini-1.5-pro" });

      // Create prompt based on titles and settings
      const prompt = `
        Türkçe bir makale yazın. Başlıklar: ${titles.join(", ")}
        Yazı türü: ${settings.articleType || "Blog Yazısı"}
        Anlatım tarzı: ${settings.tone || "Profesyonel"}
        Kelime sayısı: ${settings.wordCount || "800-1200 kelime"}
        Hedef kitle: ${settings.targetAudience || "Genel"}
        
        ${settings.includeIntro ? "Giriş paragrafı ekleyin." : ""}
        ${settings.includeFaq ? "FAQ bölümü ekleyin." : ""}
        ${settings.includeConclusion ? "Sonuç bölümü ekleyin." : ""}
        ${settings.includeSubheadings ? "Alt başlıklar kullanın." : ""}
        
        Makalenin HTML formatında olmasını istiyorum.
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      
      // Calculate word count and reading time
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200);

      // Track API usage
      await storage.incrementApiUsage(userId, "gemini", 1, content.length);

      res.json({
        content,
        htmlContent: content,
        wordCount,
        readingTime,
        metaDescription: settings.includeMetaDescription ? 
          content.substring(0, 160) + "..." : null
      });
    } catch (error) {
      console.error("Error generating content:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Bulk upload
  app.post('/api/bulk-upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      const settings = JSON.parse(req.body.settings || '{}');

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Create bulk job
      const bulkJob = await storage.createBulkJob({
        userId,
        fileName: file.originalname,
        totalArticles: data.length,
        settings,
      });

      // Process articles in background (simplified for demo)
      setImmediate(async () => {
        try {
          const userSettings = await storage.getUserSettings(userId);
          if (!userSettings?.geminiApiKey) return;

          const genAI = new GoogleGenerativeAI(userSettings.geminiApiKey);
          const model = genAI.getGenerativeModel({ model: userSettings.geminiModel || "gemini-1.5-pro" });

          let completed = 0;
          let failed = 0;

          for (const row of data as any[]) {
            try {
              const prompt = `
                Türkçe bir makale yazın.
                Başlık: ${row.title || row.başlık || row.Title || row.Başlık}
                Anahtar kelimeler: ${row.keywords || row.anahtarKelimeler || row.Keywords}
                Kategori: ${row.category || row.kategori || row.Category}
                
                Kelime sayısı: ${settings.wordCount || "800-1200 kelime"}
                Yazım stili: ${settings.tone || "Profesyonel"}
                
                HTML formatında yazın.
              `;

              const result = await model.generateContent(prompt);
              const content = result.response.text();
              const wordCount = content.split(/\s+/).length;

              await storage.createArticle({
                userId,
                title: row.title || row.başlık || row.Title || row.Başlık,
                content,
                htmlContent: content,
                wordCount,
                readingTime: Math.ceil(wordCount / 200),
                category: row.category || row.kategori || row.Category,
                keywords: (row.keywords || row.anahtarKelimeler || row.Keywords || "").split(",").map((k: string) => k.trim()),
                status: "draft",
              });

              completed++;
              await storage.incrementApiUsage(userId, "gemini", 1, content.length);
            } catch (error) {
              console.error("Error processing article:", error);
              failed++;
            }

            // Update job progress
            await storage.updateBulkJob(bulkJob.id, userId, {
              completedArticles: completed,
              failedArticles: failed,
              status: completed + failed === data.length ? "completed" : "processing",
            });
          }
        } catch (error) {
          console.error("Error processing bulk job:", error);
          await storage.updateBulkJob(bulkJob.id, userId, {
            status: "failed",
          });
        }
      });

      res.json({ jobId: bulkJob.id, totalArticles: data.length });
    } catch (error) {
      console.error("Error processing bulk upload:", error);
      res.status(500).json({ message: "Failed to process bulk upload" });
    }
  });

  // Bulk job status
  app.get('/api/bulk-jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobId = parseInt(req.params.id);
      
      const job = await storage.updateBulkJob(jobId, userId, {}); // Just fetch
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error fetching bulk job:", error);
      res.status(500).json({ message: "Failed to fetch bulk job" });
    }
  });

  // User settings
  app.get('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getUserSettings(userId);
      
      // Don't send sensitive data like API keys in full
      if (settings?.geminiApiKey) {
        settings.geminiApiKey = settings.geminiApiKey.substring(0, 8) + "...";
      }
      if (settings?.wordpressAppPassword) {
        settings.wordpressAppPassword = "***";
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post('/api/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settingsData = insertUserSettingsSchema.parse({ ...req.body, userId });
      
      const settings = await storage.upsertUserSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // Statistics
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      
      // Get API usage for current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      const apiUsage = await storage.getApiUsage(userId, currentMonth);
      
      res.json({
        ...stats,
        apiUsage: apiUsage?.requestCount || 0,
        tokenUsage: apiUsage?.tokenCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

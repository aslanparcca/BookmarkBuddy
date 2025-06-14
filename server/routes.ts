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

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

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
      const { titles, settings, focusKeywords } = req.body;
      
      // Use system API key if user hasn't set their own
      let apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      const userSettings = await storage.getUserSettings(userId);
      if (userSettings?.geminiApiKey) {
        apiKey = userSettings.geminiApiKey;
      }

      if (!apiKey) {
        return res.status(400).json({ message: "Gemini API key not available" });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: userSettings?.geminiModel || "gemini-2.5-flash" });

      // Create prompt based on titles, settings, and focus keywords
      const keywordsText = focusKeywords && focusKeywords.length > 0 
        ? `\nOdak Anahtar Kelimeler (makalede mutlaka kullanılmalı): ${focusKeywords.join(", ")}`
        : '';
      
      const prompt = `
        Türkçe bir makale yazın. Başlıklar: ${titles.join(", ")}
        ${keywordsText}
        
        Yazı türü: ${settings.articleType || "Blog Yazısı"}
        Anlatım tarzı: ${settings.tone || "Profesyonel"}
        Kelime sayısı: ${settings.wordCount || "800-1200 kelime"}
        Hedef kitle: ${settings.targetAudience || "Genel"}
        
        ${settings.includeIntro ? "Giriş paragrafı ekleyin." : ""}
        ${settings.includeFaq ? "FAQ bölümü ekleyin." : ""}
        ${settings.includeConclusion ? "Sonuç bölümü ekleyin." : ""}
        ${settings.includeSubheadings ? "Alt başlıklar kullanın." : ""}
        ${focusKeywords && focusKeywords.length > 0 ? "Odak anahtar kelimeleri doğal şekilde makalede dağıtın." : ""}
        
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

  // WordPress generation route
  app.post('/api/wordpress/generate', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const settings = req.body;
      const userSettings = await storage.getUserSettings(userId);
      
      if (!userSettings?.geminiApiKey) {
        return res.status(400).json({ message: "Gemini API key not configured. Please update your settings." });
      }

      const genAI = new GoogleGenerativeAI(userSettings.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Generate main content
      const prompt = `
        Türkçe bir WordPress makalesi oluştur. Odak anahtar kelime: "${settings.focusKeywords}"
        
        Yazı stili: ${settings.writingStyle}
        Uzunluk: ${settings.length}
        Sıkça sorulan sorular dahil et: ${settings.faqType}
        
        Makale şunları içermelidir:
        - SEO uyumlu başlık
        - Giriş paragrafı
        - Ana içerik bölümleri
        - Sonuç paragrafı
        ${settings.faqType === 'Evet' ? '- Sıkça sorulan sorular bölümü' : ''}
        
        Odak anahtar kelimeyi doğal bir şekilde makale boyunca kullan.
        Lütfen sadece makale içeriğini döndür, başka açıklama ekleme.
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const title = content.split('\n')[0].replace('#', '').trim();
      
      // Generate additional content based on settings
      let metaDescription = '';
      let summary = '';
      let youtubeVideo = '';
      
      if (settings.includeMetaDescription) {
        const metaResult = await model.generateContent(`Bu makale için 150-160 karakter arasında SEO uyumlu meta açıklama oluştur. Makale başlığı: "${title}". Sadece meta açıklamayı döndür.`);
        metaDescription = metaResult.response.text().trim();
      }
      
      if (settings.includeSummary) {
        const summaryResult = await model.generateContent(`Bu makale için 2-3 cümlelik özet oluştur: "${content.substring(0, 500)}...". Sadece özeti döndür.`);
        summary = summaryResult.response.text().trim();
      }
      
      if (settings.includeYouTube) {
        const videoResult = await model.generateContent(`Bu makale konusu için YouTube video açıklaması oluştur: "${settings.focusKeywords}". Sadece video açıklamasını döndür.`);
        youtubeVideo = videoResult.response.text().trim();
      }

      // Calculate reading time and word count
      const wordCount = content.split(' ').length;
      const readingTime = Math.ceil(wordCount / 200);

      // Save article to database
      const article = await storage.createArticle({
        userId,
        title,
        content,
        keywords: [settings.focusKeywords],
        status: 'draft',
        wordCount,
        readingTime
      });

      // Track API usage
      await storage.incrementApiUsage(userId, 'gemini', 1, wordCount);

      res.json({ 
        success: true,
        article: {
          ...article,
          metaDescription,
          youtubeVideo
        }
      });
    } catch (error) {
      console.error("WordPress generation error:", error);
      res.status(500).json({ message: "Failed to generate WordPress article" });
    }
  });

  // WordPress V2 generation route
  app.post('/api/wordpress/generate-v2', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const settings = req.body;
      const userSettings = await storage.getUserSettings(userId);
      
      if (!userSettings?.geminiApiKey) {
        return res.status(400).json({ message: "Gemini API key not configured. Please update your settings." });
      }

      const genAI = new GoogleGenerativeAI(userSettings.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // Build comprehensive prompt based on all settings
      let prompt = `
        Türkçe bir WordPress makalesi oluştur. Detaylı ayarlar:
        
        Odak Anahtar Kelime: "${settings.focusKeyword}"
        Makale Başlığı: "${settings.articleTitle || settings.focusKeyword + ' Hakkında Kapsamlı Rehber'}"
        
        Yazı Özellikleri:
        - Dil: ${settings.language}
        - Uzunluk: ${settings.sectionLength}
        - Yazı Stili: ${settings.writingStyle || 'Genel'}
        - Anlatıcı: ${settings.narrator || 'Genel'}
        
        İçerik Gereksinimleri:
        ${settings.faqNormal ? '- Sıkça sorulan sorular bölümü ekle' : ''}
        ${settings.faqSchema ? '- Sıkça sorulan sorular (Schema yapısında)' : ''}
        ${settings.table ? '- İlgili tablo ekle' : ''}
        ${settings.list ? '- Madde işaretli listeler kullan' : ''}
        ${settings.quote ? '- İlgili alıntılar ekle' : ''}
        ${settings.boldText ? '- Önemli kelimeleri kalın yap' : ''}
        ${settings.italicText ? '- Vurgu için italik kullan' : ''}
        
        Anahtar Kelimeler: ${settings.keywords || settings.focusKeyword}
        
        Makale şunları içermelidir:
        - SEO uyumlu giriş paragrafı
        - ${settings.h2Count || 8} adet H2 alt başlık ile organize edilmiş içerik
        - Her bölümde detaylı açıklamalar
        - Sonuç ve özet paragrafı
        
        Odak anahtar kelimeyi doğal bir şekilde makale boyunca ${Math.ceil(settings.sectionLength === 'Çok Uzun (1.500-2.000 kelime)' ? 15 : 8)} kez kullan.
        Lütfen sadece makale içeriğini döndür, başka açıklama ekleme.
      `;

      const result = await model.generateContent(prompt);
      const content = result.response.text();
      const title = settings.articleTitle || content.split('\n')[0].replace('#', '').trim();
      
      // Generate additional content based on settings
      let metaDescription = '';
      let summary = '';
      let youtubeVideo = '';
      
      if (settings.metaDescription) {
        const metaResult = await model.generateContent(`Bu makale için 150-160 karakter arasında SEO uyumlu meta açıklama oluştur. Makale başlığı: "${title}". Sadece meta açıklamayı döndür.`);
        metaDescription = metaResult.response.text().trim();
      }
      
      if (settings.articleSummary) {
        const summaryResult = await model.generateContent(`Bu makale için 3-4 cümlelik özet oluştur: "${content.substring(0, 500)}...". Sadece özeti döndür.`);
        summary = summaryResult.response.text().trim();
      }
      
      if (settings.youtubeVideo) {
        const videoResult = await model.generateContent(`Bu makale konusu için YouTube video script'i oluştur: "${settings.focusKeyword}". Sadece video açıklamasını döndür.`);
        youtubeVideo = videoResult.response.text().trim();
      }

      // Calculate reading time and word count
      const wordCount = content.split(' ').length;
      const readingTime = Math.ceil(wordCount / 200);

      // Save article to database
      const article = await storage.createArticle({
        userId,
        title,
        content,
        keywords: [settings.focusKeyword, ...(settings.keywords ? settings.keywords.split(',').map((k: string) => k.trim()) : [])],
        status: 'draft',
        wordCount,
        readingTime
      });

      // Track API usage
      await storage.incrementApiUsage(userId, 'gemini', 1, wordCount);

      res.json({ 
        success: true,
        article: {
          ...article,
          metaDescription,
          summary,
          youtubeVideo
        }
      });
    } catch (error) {
      console.error("WordPress V2 generation error:", error);
      res.status(500).json({ message: "Failed to generate WordPress V2 article" });
    }
  });

  // Bulk upload
  app.post('/api/bulk-upload', isAuthenticated, upload.single('excelFile'), async (req: any, res) => {
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
          const model = genAI.getGenerativeModel({ model: userSettings.geminiModel || "gemini-2.5-flash" });

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

  // URL Rewrite endpoint
  app.post('/api/url-rewrite', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = req.body;

      if (!settings.url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Fetch content from URL
      const urlResponse = await fetch(settings.url);
      if (!urlResponse.ok) {
        return res.status(400).json({ message: "Failed to fetch URL content" });
      }
      
      const html = await urlResponse.text();
      
      // Extract text content from HTML (simple extraction)
      const textContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Create comprehensive prompt for URL rewriting
      let prompt = `Sen deneyimli bir içerik editörü ve yazarsın. Aşağıdaki metni tamamen yeniden yazman gerekiyor.

KAYNAK METİN:
${textContent.substring(0, 4000)}

YAZIM PARAMETRELERİ:
- Dil: ${settings.language}
- Yazı Stili: ${settings.writingStyle || 'Genel'}
- Hedef Kitle: ${settings.targetAudience}
- Anlatıcı: ${settings.narrator}

GEREKSINIMLER:
1. Metni tamamen yeniden yaz, orijinal anlamı koruyarak
2. SEO uyumlu ve akıcı bir dil kullan
3. ${settings.boldText ? 'Önemli kelimeleri **kalın** yap' : ''}
4. ${settings.italicText ? 'Vurgulanması gereken yerleri *italik* yap' : ''}
5. ${settings.table ? 'Uygun yerlerde tablo ekle' : ''}
6. ${settings.list ? 'Uygun yerlerde liste kullan' : ''}
7. ${settings.quote ? 'Alıntı blokları ekle' : ''}

Sadece yeniden yazılmış makaleyi döndür, başka açıklama ekleme.`;

      const result = await model.generateContent(prompt);
      let content = result.response.text();
      
      // Extract title from rewritten content
      const title = content.split('\n')[0].replace(/[#*]/g, '').trim();
      
      // Generate additional content based on settings
      let metaDescription = '';
      let summary = '';
      
      if (settings.metaDescription) {
        const metaResult = await model.generateContent(`Bu makale için 150-160 karakter arasında SEO uyumlu meta açıklama oluştur. Makale başlığı: "${title}". Sadece meta açıklamayı döndür.`);
        metaDescription = metaResult.response.text().trim();
      }
      
      if (settings.articleSummary) {
        const summaryResult = await model.generateContent(`Bu makale için 2-3 cümlelik özet oluştur: "${content.substring(0, 500)}...". Sadece özeti döndür.`);
        summary = summaryResult.response.text().trim();
      }

      // Add FAQ if requested
      if (settings.faqNormal || settings.faqSchema) {
        const faqResult = await model.generateContent(`Bu makale konusu için 5 adet sıkça sorulan soru ve cevap oluştur: "${title}". ${settings.faqSchema ? 'JSON-LD schema formatında' : 'Normal formatta'} döndür.`);
        const faqContent = faqResult.response.text();
        content += '\n\n## Sıkça Sorulan Sorular\n\n' + faqContent;
      }

      // Calculate metrics
      const wordCount = content.split(' ').length;
      const readingTime = Math.ceil(wordCount / 200);

      // Save article to database
      const article = await storage.createArticle({
        userId,
        title,
        content,
        keywords: [settings.url],
        status: 'draft',
        wordCount,
        readingTime
      });

      // Track API usage
      await storage.incrementApiUsage(userId, 'gemini', 1, wordCount);

      res.json({ 
        success: true,
        article: {
          ...article,
          metaDescription,
          summary
        }
      });
    } catch (error) {
      console.error("URL rewrite error:", error);
      res.status(500).json({ message: "Failed to rewrite URL content" });
    }
  });

  // Bulk Titles V1 endpoint
  app.post('/api/bulk-titles-v1', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = req.body;

      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      let prompt = "";
      let titles: Array<{title: string, focusKeyword: string}> = [];

      switch(settings.generateType) {
        case "1": // Anahtar Kelime
          if (!settings.keywords) {
            return res.status(400).json({ message: "Anahtar kelimeler gerekli" });
          }
          
          const keywords = settings.keywords.split(',').map((k: string) => k.trim());
          
          if (settings.keywordType === "1") {
            // Beraber değerlendirme
            prompt = `${settings.titleCount} adet Türkçe makale başlığı oluştur. Anahtar kelimeler: ${keywords.join(', ')}. 
            Bu kelimelerin hepsini kapsayacak başlıklar oluştur. Her başlık için odak anahtar kelime belirle.
            JSON formatında döndür: [{"title": "başlık", "focusKeyword": "anahtar kelime"}]`;
          } else {
            // Ayrı ayrı değerlendirme
            for (const keyword of keywords.slice(0, settings.titleCount)) {
              titles.push({
                title: `${keyword} Hakkında Kapsamlı Rehber`,
                focusKeyword: keyword
              });
            }
          }
          break;

        case "2": // Web Sitesi
          if (!settings.websiteId) {
            return res.status(400).json({ message: "Web sitesi seçimi gerekli" });
          }
          prompt = `Bir WordPress sitesi için ${settings.titleCount} adet makale başlığı öner. 
          JSON formatında döndür: [{"title": "başlık", "focusKeyword": "anahtar kelime"}]`;
          break;

        case "3": // Rakip Site
          if (!settings.competitorUrl) {
            return res.status(400).json({ message: "Rakip site URL'si gerekli" });
          }
          prompt = `${settings.competitorUrl} sitesine benzer içerikler için ${settings.titleCount} adet makale başlığı oluştur.
          JSON formatında döndür: [{"title": "başlık", "focusKeyword": "anahtar kelime"}]`;
          break;

        case "4": // Manuel Başlıklar
          if (!settings.customTitle) {
            return res.status(400).json({ message: "Makale başlıkları gerekli" });
          }
          const customTitles = settings.customTitle.split('\n').filter((t: string) => t.trim());
          titles = customTitles.slice(0, settings.titleCount).map((title: string) => ({
            title: title.trim(),
            focusKeyword: title.trim().split(' ').slice(0, 2).join(' ')
          }));
          break;

        default:
          return res.status(400).json({ message: "Geçersiz oluşturma tipi" });
      }

      // Generate titles using AI if prompt is set
      if (prompt && titles.length === 0) {
        const result = await model.generateContent(prompt);
        const content = result.response.text();
        
        try {
          // Try to parse JSON response
          const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
          titles = JSON.parse(cleanContent);
        } catch (parseError) {
          // Fallback: create titles from response text
          const lines = content.split('\n').filter(line => line.trim());
          titles = lines.slice(0, settings.titleCount).map((line, index) => ({
            title: line.replace(/^\d+\.?\s*/, '').trim(),
            focusKeyword: `keyword${index + 1}`
          }));
        }
      }

      // Ensure we have the requested number of titles
      while (titles.length < settings.titleCount) {
        titles.push({
          title: `Makale Başlığı ${titles.length + 1}`,
          focusKeyword: `anahtar kelime ${titles.length + 1}`
        });
      }

      // Track API usage
      await storage.incrementApiUsage(userId, 'gemini', 1, JSON.stringify(titles).length);

      res.json({ 
        success: true,
        titles: titles.slice(0, settings.titleCount)
      });
    } catch (error) {
      console.error("Bulk titles V1 generation error:", error);
      res.status(500).json({ message: "Başlık oluşturma işlemi başarısız oldu" });
    }
  });

  // Bulk Titles V2 endpoint
  app.post('/api/bulk-titles-v2', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = req.body;

      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      let prompt = "";
      let titles: Array<{title: string, focusKeyword: string, imageKeyword: string}> = [];

      switch(settings.generateType) {
        case "1": // Anahtar Kelime
          if (!settings.keywords) {
            return res.status(400).json({ message: "Anahtar kelimeler gerekli" });
          }
          
          const keywords = settings.keywords.split(',').map((k: string) => k.trim());
          
          if (settings.keywordType === "1") {
            // Beraber değerlendirme
            prompt = `${settings.titleCount} adet Türkçe makale başlığı oluştur. Anahtar kelimeler: ${keywords.join(', ')}. 
            Bu kelimelerin hepsini kapsayacak başlıklar oluştur. Her başlık için odak anahtar kelime ve İngilizce resim anahtar kelimesi belirle.
            JSON formatında döndür: [{"title": "başlık", "focusKeyword": "anahtar kelime", "imageKeyword": "image keyword"}]`;
          } else {
            // Ayrı ayrı değerlendirme
            for (const keyword of keywords.slice(0, settings.titleCount)) {
              titles.push({
                title: `${keyword} Hakkında Kapsamlı Rehber`,
                focusKeyword: keyword,
                imageKeyword: keyword.toLowerCase().replace(/[^a-zA-Z0-9]/g, ' ')
              });
            }
          }
          break;

        case "2": // Web Sitesi
          if (!settings.websiteId) {
            return res.status(400).json({ message: "Web sitesi seçimi gerekli" });
          }
          prompt = `Bir WordPress sitesi için ${settings.titleCount} adet makale başlığı öner. 
          Her başlık için odak anahtar kelime ve İngilizce resim anahtar kelimesi belirle.
          JSON formatında döndür: [{"title": "başlık", "focusKeyword": "anahtar kelime", "imageKeyword": "image keyword"}]`;
          break;

        case "3": // Rakip Site
          if (!settings.competitorUrl) {
            return res.status(400).json({ message: "Rakip site URL'si gerekli" });
          }
          prompt = `${settings.competitorUrl} sitesine benzer içerikler için ${settings.titleCount} adet makale başlığı oluştur.
          Her başlık için odak anahtar kelime ve İngilizce resim anahtar kelimesi belirle.
          JSON formatında döndür: [{"title": "başlık", "focusKeyword": "anahtar kelime", "imageKeyword": "image keyword"}]`;
          break;

        case "4": // Manuel Başlıklar
          if (!settings.customTitle) {
            return res.status(400).json({ message: "Makale başlıkları gerekli" });
          }
          const customTitles = settings.customTitle.split('\n').filter((t: string) => t.trim());
          titles = customTitles.slice(0, settings.titleCount).map((title: string) => ({
            title: title.trim(),
            focusKeyword: title.trim().split(' ').slice(0, 2).join(' '),
            imageKeyword: title.trim().split(' ').slice(0, 2).join(' ').toLowerCase()
          }));
          break;

        case "excel": // Excel Upload
          // Excel processing would be handled here
          return res.status(501).json({ message: "Excel işleme henüz desteklenmiyor" });

        default:
          return res.status(400).json({ message: "Geçersiz oluşturma tipi" });
      }

      // Generate titles using AI if prompt is set
      if (prompt && titles.length === 0) {
        const result = await model.generateContent(prompt);
        const content = result.response.text();
        
        try {
          // Try to parse JSON response
          const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
          titles = JSON.parse(cleanContent);
        } catch (parseError) {
          // Fallback: create titles from response text
          const lines = content.split('\n').filter(line => line.trim());
          titles = lines.slice(0, settings.titleCount).map((line, index) => ({
            title: line.replace(/^\d+\.?\s*/, '').trim(),
            focusKeyword: `keyword${index + 1}`,
            imageKeyword: `image${index + 1}`
          }));
        }
      }

      // Ensure we have the requested number of titles
      while (titles.length < settings.titleCount) {
        titles.push({
          title: `Makale Başlığı ${titles.length + 1}`,
          focusKeyword: `anahtar kelime ${titles.length + 1}`,
          imageKeyword: `image keyword ${titles.length + 1}`
        });
      }

      // Track API usage
      await storage.incrementApiUsage(userId, 'gemini', 1, JSON.stringify(titles).length);

      res.json({ 
        success: true,
        titles: titles.slice(0, settings.titleCount)
      });
    } catch (error) {
      console.error("Bulk titles V2 generation error:", error);
      res.status(500).json({ message: "Başlık oluşturma işlemi başarısız oldu" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

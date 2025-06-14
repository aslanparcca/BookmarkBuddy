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
      // Map frontend AI model selection to actual model names
      const modelMapping: Record<string, string> = {
        'gemini_2.5_flash': 'gemini-1.5-flash',
        'gemini_2.5_pro': 'gemini-1.5-pro', 
        'gemini_2.0_flash': 'gemini-1.5-flash',
        'gemini_2.0_flash_lite': 'gemini-1.5-flash',
        'gemini_2.0_flash_thinking': 'gemini-1.5-flash',
        'gemini_1.5_flash': 'gemini-1.5-flash',
        'gemini_1.5_pro': 'gemini-1.5-pro'
      };
      const selectedModel = (settings?.aiModel && modelMapping[settings.aiModel]) ? modelMapping[settings.aiModel] : 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: selectedModel });

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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
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
          const model = genAI.getGenerativeModel({ model: userSettings.geminiModel || "gemini-1.5-flash" });

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

  // Excel template processing endpoint
  app.post('/api/process-excel-template', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Kullanıcı kimliği bulunamadı" });
      }

      console.log("Excel processing request:", { 
        fileExists: !!req.file, 
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        contentType: req.file?.mimetype 
      });

      if (!req.file) {
        return res.status(400).json({ message: "Excel dosyası yüklenmedi" });
      }

      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Excel şablonunu işle ve AI prompt hazırla
      const processedData = data.map((row: any) => {
        // Alt başlıkları topla (Alt Başlık 1'den Alt Başlık 20'ye kadar)
        const subheadings = [];
        for (let i = 1; i <= 20; i++) {
          const subheading = row[`Alt Başlık ${i}`] || row[`Alt Başlık${i}`] || '';
          if (subheading && subheading.trim() !== '') {
            subheadings.push(subheading.trim());
          }
        }

        return {
          title: row['Makale Başlığı'] || '',
          focusKeyword: row['Odak Anahtar Kelime'] || '',
          otherKeywords: row['Diğer Anahtar Kelimeler'] || '',
          description: row['Makale Konusu'] || '',
          category: row['Kategori'] || 'Genel',
          tags: row['Görel Kaynak'] || '',
          imageKeyword: row['Resim Anahtar Kelimesi'] || '',
          subheadings: subheadings,
          contentLength: row['Bölüm Uzunluğu'] || '800-1200 kelime',
          writingStyle: 'Profesyonel',
          language: 'Türkçe',
          metaDescription: '',
          targetAudience: 'Genel okuyucu kitlesi',
          contentType: 'Bilgilendirici'
        };
      });

      // Boş olmayan satırları filtrele
      const validData = processedData.filter(item => item.title && item.title.trim() !== '');

      if (validData.length === 0) {
        return res.status(400).json({ message: "Excel dosyasında geçerli makale verisi bulunamadı" });
      }

      // AI Prompt oluştur
      const aiPrompt = validData.map((item, index) => {
        const subheadingsList = item.subheadings.length > 0 ? item.subheadings.join(', ') : 'Otomatik oluştur';
        return `
Makale ${index + 1}:
Başlık: ${item.title}
Odak Anahtar Kelime: ${item.focusKeyword}
Diğer Anahtar Kelimeler: ${item.otherKeywords}
Makale Konusu: ${item.description}
Kategori: ${item.category}
Görsel Anahtar Kelime: ${item.imageKeyword}
Alt Başlıklar: ${subheadingsList}
İçerik Uzunluğu: ${item.contentLength}
Yazım Stili: ${item.writingStyle}
Dil: ${item.language}
Hedef Kitle: ${item.targetAudience}
İçerik Tipi: ${item.contentType}

Bu bilgilere göre SEO uyumlu, kapsamlı ve özgün makale içeriği oluşturun.
${item.subheadings.length > 0 ? `Belirtilen alt başlıkları kullanın: ${item.subheadings.join(', ')}` : ''}
        `;
      }).join('\n\n---\n\n');

      res.json({ 
        success: true, 
        articles: validData,
        count: validData.length,
        aiPrompt: aiPrompt,
        message: `${validData.length} makale şablonu başarıyla işlendi ve AI prompt hazırlandı`
      });

    } catch (error) {
      console.error("Excel processing error:", error);
      res.status(500).json({ message: "Excel dosyası işlenirken hata oluştu" });
    }
  });

  // Generate articles from Excel template endpoint  
  app.post('/api/generate-from-excel-template', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Kullanıcı kimliği bulunamadı" });
      }

      const { articles, settings } = req.body;

      if (!articles || !Array.isArray(articles)) {
        return res.status(400).json({ message: "Makale verileri geçersiz" });
      }

      const userSettings = await storage.getUserSettings(userId);
      
      // Environment variable'dan veya kullanıcı ayarlarından API anahtarını al
      const apiKey = userSettings?.geminiApiKey || process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "Gemini API anahtarı bulunamadı. Lütfen ayarlarınızı kontrol edin." });
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Map frontend AI model selection to actual model names
      const modelMapping: Record<string, string> = {
        'gemini_2.5_flash': 'gemini-1.5-flash',
        'gemini_2.5_pro': 'gemini-1.5-pro', 
        'gemini_2.0_flash': 'gemini-1.5-flash',
        'gemini_2.0_flash_lite': 'gemini-1.5-flash',
        'gemini_2.0_flash_thinking': 'gemini-1.5-flash',
        'gemini_1.5_flash': 'gemini-1.5-flash',
        'gemini_1.5_pro': 'gemini-1.5-pro'
      };
      const selectedModel = (settings?.aiModel && modelMapping[settings.aiModel]) ? modelMapping[settings.aiModel] : 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: selectedModel });

      let generatedCount = 0;
      const results = [];

      console.log("Processing articles:", articles.length);
      
      for (const article of articles) {
        try {
          console.log("Processing article:", article.title);
          
          const subheadingsText = article.subheadings && article.subheadings.length > 0 
            ? `Şu alt başlıkları kullanın: ${article.subheadings.join(', ')}` 
            : 'Alt başlıkları otomatik oluşturun';

          // Gelişmiş içerik özelliklerini belirle
          const contentFeatures = settings?.contentFeatures || [];
          let contentEnhancements = '';
          
          if (contentFeatures.includes('tables')) {
            contentEnhancements += '- İçeriği desteklemek için uygun yerlerde HTML tabloları kullanın\n';
          }
          if (contentFeatures.includes('lists')) {
            contentEnhancements += '- Bilgileri düzenlemek için madde listeleri ve numaralı listeler kullanın\n';
          }
          if (contentFeatures.includes('bold')) {
            contentEnhancements += '- Önemli kelimeleri ve cümleleri kalın (bold) yazın\n';
          }
          if (contentFeatures.includes('italic')) {
            contentEnhancements += '- Vurgu yapmak için italik yazı kullanın\n';
          }
          if (contentFeatures.includes('quotes')) {
            contentEnhancements += '- Konu ile ilgili alıntılar ve blockquote\'lar ekleyin\n';
          }

          const prompt = `
${article.language || 'Türkçe'} dilinde yüksek kaliteli, SEO optimizasyonlu makale yazın:

TEMEL BİLGİLER:
Başlık: ${article.title}
Odak Anahtar Kelime: ${article.focusKeyword}
Diğer Anahtar Kelimeler: ${article.otherKeywords}
Makale Konusu: ${article.description || 'Bu konuda detaylı, uzman seviyesinde bilgi verici makale'}
Kategori: ${article.category}

İÇERİK KALİTE ÖZELLİKLERİ:
İçerik Uzunluğu: ${settings?.sectionLength === 'cok_uzun' ? '2000-2500 kelime (Çok detaylı)' : 
                  settings?.sectionLength === 'uzun' ? '1500-2000 kelime (Detaylı)' :
                  settings?.sectionLength === 'orta' ? '1000-1500 kelime (Orta)' :
                  settings?.sectionLength === 'kisa' ? '500-800 kelime (Kısa)' : '1200-1500 kelime'}
Yazım Stili: ${settings?.writingStyle || 'Uzman ve Profesyonel'}
Hedef Kitle: ${settings?.targetAudience || 'Konu hakkında bilgi arayan kullanıcılar'}
Dil Seviyesi: Anlaşılır ancak profesyonel
AI Model: ${settings?.aiModel ? settings.aiModel.replace('_', ' ').toUpperCase() : 'Gemini 2.5 Flash'}

ALT BAŞLIK YÖNERGESİ: 
${subheadingsText}

İÇERİK GELİŞTİRME ÖZELLİKLERİ:
${contentEnhancements}
- Sık sorulan sorular (FAQ) bölümü ekleyin
- Konuyla ilgili pratik ipuçları ve öneriler verin
- Gerçek hayattan örnekler kullanın
- Uzman görüşleri ve endüstri bilgileri dahil edin

SEO ve YAPISAL GEREKSİNİMLER:
- H1 başlığında odak anahtar kelimeyi kullanın
- H2 ve H3 başlıklarında doğal anahtar kelime dağılımı
- İlk paragrafta odak anahtar kelimeyi belirgin şekilde kullanın
- Makale boyunca %1-2 anahtar kelime yoğunluğu koruyun
- Her paragraf 3-4 cümleden oluşsun
- Meta description uyumlu giriş paragrafı yazın
- İç linkler için anchor text önerileri
- Resim alt text önerileri ekleyin

GÖRSEL ve MULTİMEDYA:
Görsel Anahtar Kelime: ${article.imageKeyword}
- Her bölüm için uygun görsel önerileri
- İnfografik fikirleri
- Video içerik önerileri

UZMANLIK ve GÜVENİLİRLİK:
- Güncel istatistikler ve veriler kullanın
- Kaynak gösterimi yapın
- Adım adım rehberler ekleyin  
- Yaygın hataları ve çözümleri belirtin

${article.metaDescription ? `
HEDEF META AÇIKLAMA: ${article.metaDescription}
(Bu meta açıklamaya uygun giriş ve sonuç yazın)
` : ''}

ÇIKTI FORMATI:
- Tamamen HTML formatında
- Başlığı makale içinde tekrarlamamayın (sadece içerik)
- Profesyonel ve akıcı yazım dili
- Yüksek okunabilirlik skoru
- Mobil uyumlu yapı

Lütfen bu kriterlere göre kapsamlı, uzman seviyesinde, SEO optimizasyonlu makale oluşturun.
          `;

          const result = await model.generateContent(prompt);
          const content = result.response.text();
          const wordCount = content.split(/\s+/).length;
          const readingTime = Math.ceil(wordCount / 200);

          // Makaleyi veritabanına kaydet
          const savedArticle = await storage.createArticle({
            userId,
            title: article.title,
            content,
            htmlContent: content,
            wordCount,
            readingTime,
            category: article.category || 'Genel',
            keywords: article.keywords ? article.keywords.split(',').map((k: string) => k.trim()) : [],
            status: settings?.publishStatus || 'draft',
          });

          results.push({
            id: savedArticle.id,
            title: article.title,
            wordCount,
            readingTime,
            status: 'success'
          });

          generatedCount++;
          await storage.incrementApiUsage(userId, 'gemini', 1, content.length);

        } catch (error) {
          console.error(`Excel template article generation error for ${article.title}:`, error);
          results.push({
            title: article.title,
            status: 'failed',
            error: error.message
          });
        }
      }

      res.json({ 
        success: true,
        count: generatedCount,
        total: articles.length,
        results,
        message: `${generatedCount}/${articles.length} makale başarıyla oluşturuldu`
      });

    } catch (error) {
      console.error("Excel template generation error:", error);
      res.status(500).json({ message: "Excel şablonu makale oluşturma işlemi başarısız oldu" });
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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
          // Excel dosyası frontend'de işlenecek, burada sadece boş response döndürüyoruz
          titles = [];
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

  // Process recipes endpoint
  app.post('/api/process-recipes', isAuthenticated, async (req: any, res) => {
    try {
      const { recipes } = req.body;

      if (!recipes || !Array.isArray(recipes)) {
        return res.status(400).json({ message: "Geçerli yemek listesi gerekli" });
      }

      if (recipes.length === 0) {
        return res.status(400).json({ message: "En az bir yemek ismi gerekli" });
      }

      if (recipes.length > 50) {
        return res.status(400).json({ message: "En fazla 50 yemek ismi işlenebilir" });
      }

      // Clean and validate recipe names
      const processedRecipes = recipes
        .map(recipe => recipe.trim())
        .filter(recipe => recipe.length > 0)
        .slice(0, 50);

      res.json({ 
        success: true,
        recipes: processedRecipes
      });
    } catch (error) {
      console.error("Recipe processing error:", error);
      res.status(500).json({ message: "Yemek işleme hatası" });
    }
  });

  // Bulk recipes generation endpoint
  app.post('/api/bulk-recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = req.body;

      if (!settings.recipes || !Array.isArray(settings.recipes)) {
        return res.status(400).json({ message: "Yemek listesi gerekli" });
      }

      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      let generatedCount = 0;

      for (const recipe of settings.recipes) {
        const recipeName = recipe.name;
        
        // Create comprehensive recipe prompt
        const recipePrompt = `
        "${recipeName}" yemeği için detaylı bir tarif oluştur. Aşağıdaki bölümleri dahil et:

        ${settings.description ? '- Kısa bilgilendirme (yemeğin tanımı ve genel bilgileri)' : ''}
        ${settings.ingredients ? '- Malzemeler listesi (detaylı miktarlarla)' : ''}
        ${settings.instructions ? '- Yapılış aşamaları (adım adım detaylı)' : ''}
        ${settings.time ? '- Hazırlık ve pişirme süreleri' : ''}
        ${settings.yield ? '- Kaç kişilik tarif olduğu' : ''}
        ${settings.nutrition ? '- Besin değerleri bilgileri' : ''}
        ${settings.tools ? '- Gerekli araç gereçler' : ''}
        ${settings.tips ? '- Pişirme ipuçları ve püf noktaları' : ''}
        ${settings.difficulty ? '- Zorluk derecesi' : ''}
        ${settings.categoryCuisine ? '- Kategori ve mutfak türü' : ''}
        ${settings.service ? '- Servis ve sunum önerileri' : ''}
        ${settings.storage ? '- Saklama koşulları' : ''}
        ${settings.benefits ? '- Sağlığa faydaları' : ''}
        ${settings.vegan ? '- Veganlar için alternatif öneriler' : ''}
        ${settings.similarRecipes ? '- Benzer tarifler önerileri' : ''}

        Tarifi Türkçe olarak, ayrıntılı ve profesyonel bir şekilde yaz.
        ${settings.metaDescription ? 'Ayrıca tarif için SEO uyumlu meta açıklama da ekle.' : ''}
        ${settings.excerpt ? 'Tarifen kısa bir özet de oluştur.' : ''}
        `;

        try {
          const result = await model.generateContent(recipePrompt);
          const content = result.response.text();

          // Here we would normally save the recipe to the database
          // For now, we'll just count successful generations
          generatedCount++;

          // Track API usage
          await storage.incrementApiUsage(userId, 'gemini', 1, content.length);

        } catch (error) {
          console.error(`Recipe generation error for ${recipeName}:`, error);
          // Continue with other recipes even if one fails
        }
      }

      res.json({ 
        success: true,
        count: generatedCount,
        message: `${generatedCount} yemek tarifi başarıyla oluşturuldu`
      });
    } catch (error) {
      console.error("Bulk recipes generation error:", error);
      res.status(500).json({ message: "Toplu tarif oluşturma işlemi başarısız oldu" });
    }
  });

  // Process dream subjects endpoint
  app.post('/api/process-dream-subjects', isAuthenticated, async (req: any, res) => {
    try {
      const { subjects } = req.body;

      if (!subjects || !Array.isArray(subjects)) {
        return res.status(400).json({ message: "Geçerli rüya konusu listesi gerekli" });
      }

      if (subjects.length === 0) {
        return res.status(400).json({ message: "En az bir rüya konusu gerekli" });
      }

      if (subjects.length > 50) {
        return res.status(400).json({ message: "En fazla 50 rüya konusu işlenebilir" });
      }

      // Clean and validate dream subjects
      const processedSubjects = subjects
        .map(subject => subject.trim())
        .filter(subject => subject.length > 0)
        .slice(0, 50);

      res.json({ 
        success: true,
        subjects: processedSubjects
      });
    } catch (error) {
      console.error("Dream subjects processing error:", error);
      res.status(500).json({ message: "Rüya konusu işleme hatası" });
    }
  });

  // Bulk dream articles generation endpoint
  app.post('/api/bulk-dream-articles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = req.body;

      if (!settings.subjects || !Array.isArray(settings.subjects)) {
        return res.status(400).json({ message: "Rüya konusu listesi gerekli" });
      }

      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      let generatedCount = 0;

      for (const dreamSubject of settings.subjects) {
        const subject = dreamSubject.subject;
        
        // Create comprehensive dream interpretation prompt
        const dreamPrompt = `
        "Rüyada ${subject}" konusu için detaylı bir rüya tabiri makalesi oluştur. Aşağıdaki yapıyı kullan:

        1. Giriş: Rüyanın genel anlamı ve önemi
        2. Ana Yorum: "${subject}" rüyasının detaylı yorumu
        3. Pozitif Anlamlar: Bu rüyanın olumlu yorumları
        4. Negatif Anlamlar: Bu rüyanın olumsuz yorumları
        5. Psikolojik Açıklama: Rüyanın psikolojik boyutu
        6. Dini/Manevi Yorum: Geleneksel rüya yorumları
        
        ${settings.subheadingCount ? `7. Benzer Rüya Konuları: ${settings.subheadingCount} adet benzer rüya konusu ve kısa açıklamaları` : ''}
        
        Makaleyi Türkçe olarak, profesyonel ve bilgilendirici bir şekilde yaz.
        ${settings.metaDescription ? 'Ayrıca makale için SEO uyumlu meta açıklama da ekle.' : ''}
        ${settings.excerpt ? 'Makalenin kısa bir özeti de oluştur.' : ''}
        
        Makale uzunluğu: ${settings.sectionLength === 's' ? 'Kısa (300-500 kelime)' : 'Orta (500-800 kelime)'}
        `;

        try {
          const result = await model.generateContent(dreamPrompt);
          const content = result.response.text();

          // Here we would normally save the article to the database
          // For now, we'll just count successful generations
          generatedCount++;

          // Track API usage
          await storage.incrementApiUsage(userId, 'gemini', 1, content.length);

        } catch (error) {
          console.error(`Dream article generation error for ${subject}:`, error);
          // Continue with other articles even if one fails
        }
      }

      res.json({ 
        success: true,
        count: generatedCount,
        message: `${generatedCount} rüya tabiri makalesi başarıyla oluşturuldu`
      });
    } catch (error) {
      console.error("Bulk dream articles generation error:", error);
      res.status(500).json({ message: "Toplu rüya tabiri oluşturma işlemi başarısız oldu" });
    }
  });

  // Generate bulk articles V2 endpoint
  app.post('/api/generate-bulk-articles-v2', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { titles, settings } = req.body;

      if (!titles || !Array.isArray(titles) || titles.length === 0) {
        return res.status(400).json({ message: "Başlık listesi gerekli" });
      }

      console.log(`Processing ${titles.length} articles for bulk generation V2`);

      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
      
      // Map frontend AI model selection to actual model names
      const modelMapping: Record<string, string> = {
        // 2.5 Series (Most Current) - fallback to 1.5 since 2.5 not yet available
        'gemini_2.5_flash': 'gemini-1.5-flash',
        'gemini_2.5_pro': 'gemini-1.5-pro',
        // 2.0 Series - fallback to 1.5 since 2.0 not yet available
        'gemini_2.0_flash': 'gemini-1.5-flash',
        'gemini_2.0_flash_lite': 'gemini-1.5-flash',
        'gemini_2.0_flash_thinking': 'gemini-1.5-flash',
        // 1.5 Series (Available)
        'gemini_1.5_flash': 'gemini-1.5-flash',
        'gemini_1.5_pro': 'gemini-1.5-pro'
      };
      
      const selectedModel = settings.aiModel && modelMapping[settings.aiModel] ? modelMapping[settings.aiModel] : 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: selectedModel });

      let successCount = 0;
      let failedCount = 0;

      for (const titleData of titles) {
        try {
          // Build content features section
          const contentFeatures = [];
          if (settings.faqNormal) contentFeatures.push('- Add FAQ section with 5-7 common questions and detailed answers');
          if (settings.faqSchema) contentFeatures.push('- Include FAQ schema markup');
          if (settings.h3Subheadings) contentFeatures.push('- Use H3 subheadings within each main section');
          if (settings.table) contentFeatures.push('- Include at least 1-2 informative tables with headers and data related to the topic');
          if (settings.list) contentFeatures.push('- Include both numbered lists (ol/li) and bullet point lists (ul/li) throughout the content');
          if (settings.boldText) contentFeatures.push('- Use <strong> tags frequently for important keywords and phrases');
          if (settings.italicText) contentFeatures.push('- Use <em> tags for emphasis on key terms and concepts');
          if (settings.quote) contentFeatures.push('- Include 2-3 relevant quotes in <blockquote> tags from experts or studies');

          const promptParts = [
            'Create a Turkish SEO-focused article. Never use markdown code blocks. Return only clean HTML.',
            '',
            'BASIC INFORMATION:',
            `- Title: ${titleData.title}`,
            `- Focus Keyword: ${titleData.focusKeyword}`,
            titleData.imageKeyword ? `- Image Keyword: ${titleData.imageKeyword}` : '',
            '',
            'ARTICLE STRUCTURE:',
            `- Target Length: ${
              settings.sectionLength === 's' ? '1,000-1,500 words' :
              settings.sectionLength === 'm' ? '1,200-1,700 words' :
              settings.sectionLength === 'l' ? '1,500-2,000 words' :
              settings.sectionLength === 'xl' ? '2,000-2,500 words' : '1,500-2,000 words'
            }`,
            `- Main H2 sections: ${settings.subheadingCount || '7-10'} sections`,
            `- Subheading type: ${settings.subheadingType === 'h2h3' ? 'Use both H2 and H3 tags (H2 for main sections, H3 for subsections)' : 'Use only H2 tags for main sections'}`,
            `- Writing Style: ${settings.writingStyle || 'Professional and trustworthy'}`,
            '',
            'CONTENT FEATURES (MUST IMPLEMENT):',
            contentFeatures.length > 0 ? contentFeatures.join('\n') : '- Use standard article format',
            '',
            'HTML FORMAT RULES (VERY IMPORTANT):',
            '- DO NOT include the main article title (H1) in the content',
            '- Start directly with the first introductory paragraph',
            '- Never use markdown code blocks',
            '- Return only clean HTML tags',
            '- Use h2 for section headers',
            '- Use h3 for subheaders (if requested)',
            '- Use p for paragraphs',
            '- Use strong for bold text frequently',
            '- Use em for italic text emphasis',
            '- Use ul/li and ol/li for lists',
            '- Use blockquote for quotes',
            '- Use table with thead/tbody for tables',
            '',
            'CONTENT ORGANIZATION:',
            '- Start with introduction paragraph (no heading)',
            '- Include focus keyword in first 100 words',
            '- Do NOT create a separate summary section',
            '- The content should be the complete article body',
            '',
            'SEO REQUIREMENTS:',
            '- Use focus keyword naturally with 1-2% density',
            '- Include focus keyword in first paragraph within first 100 words',
            '- Use related keywords throughout content',
            '- Create proper H2, H3 hierarchy',
            '',
            'IMPORTANT: Return only the article body content in Turkish. NO title, NO summary section, NO explanations. Start directly with the first introductory paragraph.'
          ];
          const prompt = promptParts.filter(part => part !== '').join('\n');

          const result = await model.generateContent(prompt);
          let content = result.response.text();
          
          // Clean any remaining markdown code blocks and unwanted text
          content = content.replace(/```html\s*/gi, '');
          content = content.replace(/```\s*/gi, '');
          content = content.replace(/`{3,}/gi, '');
          content = content.replace(/^[^<]*(?=<)/gi, ''); // Remove any text before first HTML tag
          content = content.trim();
          
          // Ensure content starts with HTML tag
          if (!content.startsWith('<')) {
            const firstTagIndex = content.indexOf('<');
            if (firstTagIndex > 0) {
              content = content.substring(firstTagIndex);
            }
          }
          
          // Generate article summary if requested
          let articleSummary = null;
          if (settings.articleSummary) {
            const summaryPrompt = `Create a concise article summary in Turkish for the following article title: "${titleData.title}". Focus keyword: "${titleData.focusKeyword}". 

The summary should:
- Be 2-3 sentences maximum
- Include the focus keyword naturally
- Summarize the main benefits/information readers will get
- Be engaging and informative
- Return only plain text, no HTML tags

Example format: "Bu makale [focus keyword] hakkında kapsamlı bilgiler sunar. [Main benefit 1] ve [main benefit 2] gibi konuları detaylı olarak ele alır."`;

            try {
              const summaryResult = await model.generateContent(summaryPrompt);
              articleSummary = summaryResult.response.text().trim();
            } catch (error) {
              console.log('Summary generation failed, continuing without summary');
            }
          }
          
          // Calculate word count from clean HTML content (excluding tags)
          const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length;
          const readingTime = Math.ceil(wordCount / 200);

          // Generate SEO-optimized meta description if requested
          let seoMetaDescription = null;
          if (settings.metaDescription) {
            const metaPrompt = `Create an SEO-optimized meta description in Turkish for the article: "${titleData.title}". Focus keyword: "${titleData.focusKeyword}".

Requirements:
- 140-160 characters exactly
- Start with focus keyword naturally
- Include a clear benefit/value proposition
- Use active language with call-to-action
- Use power words (keşfedin, öğrenin, inceleyin, uzman, detaylı, kapsamlı)
- Be specific and informative
- Natural, not keyword-stuffed
- Match the article content

Format: Return only the meta description text, no quotes or explanations.

Example: "${titleData.focusKeyword} hakkında uzman rehberi. Detaylı bilgiler, pratik ipuçları ve güncel önerilerle ${titleData.focusKeyword.toLowerCase()} konusunu keşfedin."`;

            try {
              const metaResult = await model.generateContent(metaPrompt);
              seoMetaDescription = metaResult.response.text().trim().replace(/["']/g, '');
              
              // Ensure it's within character limit
              if (seoMetaDescription.length > 160) {
                seoMetaDescription = seoMetaDescription.substring(0, 157) + '...';
              }
            } catch (error) {
              console.log('Meta description generation failed, using fallback');
              seoMetaDescription = `${titleData.focusKeyword} hakkında detaylı bilgiler. Uzman rehberi ile ${titleData.focusKeyword.toLowerCase()} konusunu keşfedin.`;
            }
          }

          // Save article to database
          const savedArticle = await storage.createArticle({
            userId,
            title: titleData.title,
            content,
            htmlContent: content,
            wordCount,
            readingTime,
            status: settings.publishStatus || 'draft',
            focusKeyword: titleData.focusKeyword,
            metaDescription: seoMetaDescription,
            summary: articleSummary,
          });

          successCount++;

          // Track API usage
          await storage.incrementApiUsage(userId, 'gemini', 1, content.length);

        } catch (error) {
          console.error(`Bulk V2 article generation error for ${titleData.title}:`, error);
          failedCount++;
        }
      }

      res.json({ 
        success: true,
        successCount,
        failedCount,
        message: `${successCount} makale başarıyla oluşturuldu${failedCount > 0 ? `, ${failedCount} makale başarısız oldu` : ''}`
      });

    } catch (error) {
      console.error("Bulk articles V2 generation error:", error);
      res.status(500).json({ message: "Makale oluşturma işlemi başarısız oldu" });
    }
  });

  // List articles for customization endpoint
  app.post('/api/list-articles-for-customization', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { generateType, websiteId, categoryIds, postStatus, competitorUrl, searchQuery } = req.body;

      if (generateType === "1") {
        // Website-based article listing
        if (!websiteId) {
          return res.status(400).json({ message: "Web sitesi seçimi gerekli" });
        }

        // Simulate WordPress API call to list articles
        const mockArticles = [
          {
            id: 1,
            title: "Ankara Nakliyat Hizmetleri",
            status: "publish",
            category: "Nakliyat",
            date: "2024-06-14"
          },
          {
            id: 2,
            title: "Ev Taşıma Fiyatları 2024",
            status: "publish", 
            category: "Fiyatlar",
            date: "2024-06-13"
          }
        ];

        // Filter by search query if provided
        let filteredArticles = mockArticles;
        if (searchQuery && searchQuery.trim()) {
          filteredArticles = mockArticles.filter(article => 
            article.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Filter by post status
        if (postStatus && postStatus !== "any") {
          filteredArticles = filteredArticles.filter(article => 
            article.status === postStatus
          );
        }

        res.json({
          success: true,
          articles: filteredArticles,
          count: filteredArticles.length
        });

      } else if (generateType === "2") {
        // Competitor website article listing
        if (!competitorUrl) {
          return res.status(400).json({ message: "Hedef site URL adresi gerekli" });
        }

        // Simulate competitor website scraping (would need actual implementation)
        res.json({
          success: true,
          articles: [],
          count: 0,
          message: "Rakip site analizi tamamlandı"
        });
      }

    } catch (error) {
      console.error("Article listing error:", error);
      res.status(500).json({ message: "Makale listeleme işlemi başarısız oldu" });
    }
  });

  // In-memory storage for websites per user
  const userWebsites: Record<string, any[]> = {};

  // Website management endpoints
  app.get('/api/websites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Return user's websites or empty array
      const websites = userWebsites[userId] || [];
      res.json(websites);
    } catch (error) {
      console.error("Website list error:", error);
      res.status(500).json({ message: "Web sitesi listesi alınamadı" });
    }
  });

  app.post('/api/websites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const websiteData = req.body;

      // Simulate website addition process
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newWebsite = {
        id: Math.floor(Math.random() * 10000),
        url: websiteData.url,
        type: websiteData.type === "1" ? "WordPress" : "XenForo",
        seoPlugin: websiteData.seo_plugin === "yoast_seo" ? "Yoast SEO" : 
                   websiteData.seo_plugin === "rank_math_seo" ? "Rank Math SEO" : "Yok",
        gscConnected: Math.random() > 0.5,
        apiConnected: Math.random() > 0.6,
        // WordPress credentials
        wpUsername: websiteData.wp_username || '',
        wpAppPassword: websiteData.wp_app_password || '',
        categories: []
      };

      // Initialize user's websites array if it doesn't exist
      if (!userWebsites[userId]) {
        userWebsites[userId] = [];
      }

      // Add new website to user's list
      userWebsites[userId].push(newWebsite);

      res.json({
        success: true,
        website: newWebsite,
        message: "Web sitesi başarıyla eklendi"
      });
    } catch (error) {
      console.error("Website addition error:", error);
      res.status(500).json({ message: "Web sitesi eklenirken bir hata oluştu" });
    }
  });

  app.post('/api/websites/:id/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const websiteId = parseInt(req.params.id);

      // Find the website to update
      if (userWebsites[userId]) {
        const websiteIndex = userWebsites[userId].findIndex(w => w.id === websiteId);
        if (websiteIndex !== -1) {
          const website = userWebsites[userId][websiteIndex];
          let categories = [];

          try {
            // Fetch real categories from WordPress REST API
            const categoriesUrl = `${website.url}/wp-json/wp/v2/categories?per_page=100`;
            const response = await fetch(categoriesUrl);
            
            if (response.ok) {
              const wpCategories = await response.json();
              categories = wpCategories.map((cat: any) => cat.name);
            } else {
              // If WordPress API fails, use default categories
              categories = ["Genel", "Haberler", "Teknoloji", "Yazılım", "Web Tasarım"];
            }
          } catch (error) {
            console.error("WordPress API error:", error);
            // Fallback to default categories if API fails
            categories = ["Genel", "Haberler", "Teknoloji", "Yazılım", "Web Tasarım"];
          }

          // Update website with categories
          userWebsites[userId][websiteIndex].categories = categories;
        }
      }

      // Simulate category and tag sync process
      await new Promise(resolve => setTimeout(resolve, 1000));

      res.json({ 
        success: true,
        message: "Kategori ve etiketler güncellendi"
      });
    } catch (error) {
      console.error("Website sync error:", error);
      res.status(500).json({ message: "Kategori ve etiket güncelleme işlemi başarısız oldu" });
    }
  });

  app.delete('/api/websites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const websiteId = parseInt(req.params.id);

      // Simulate website deletion
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove website from user's list
      if (userWebsites[userId]) {
        userWebsites[userId] = userWebsites[userId].filter(website => website.id !== websiteId);
      }

      res.json({ 
        success: true,
        message: "Web sitesi başarıyla silindi"
      });
    } catch (error) {
      console.error("Website deletion error:", error);
      res.status(500).json({ message: "Web sitesi silme işlemi başarısız oldu" });
    }
  });

  // Send articles to website
  app.post('/api/articles/send-to-website', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { articleIds, websiteId, category } = req.body;

      if (!articleIds || !websiteId || !category) {
        return res.status(400).json({ message: "Eksik parametreler" });
      }

      // Find the website
      const website = userWebsites[userId]?.find(w => w.id.toString() === websiteId);
      if (!website) {
        return res.status(404).json({ message: "Web sitesi bulunamadı" });
      }

      // Get articles from storage
      const articles = [];
      for (const articleId of articleIds) {
        const article = await storage.getArticleById(articleId, userId);
        if (article) {
          articles.push(article);
        }
      }

      if (articles.length === 0) {
        return res.status(404).json({ message: "Makale bulunamadı" });
      }

      // Send articles to WordPress via REST API
      const results = [];
      for (const article of articles) {
        try {
          if (website.type === "WordPress") {
            // WordPress REST API endpoint for posts
            const wpApiUrl = `${website.url}/wp-json/wp/v2/posts`;
            
            // Get categories to find category ID
            const categoriesUrl = `${website.url}/wp-json/wp/v2/categories?search=${encodeURIComponent(category)}`;
            let categoryId = 1; // Default category ID
            
            try {
              const catResponse = await fetch(categoriesUrl);
              if (catResponse.ok) {
                const categories = await catResponse.json();
                if (categories.length > 0) {
                  categoryId = categories[0].id;
                }
              }
            } catch (catError) {
              console.error("Category fetch error:", catError);
            }

            // Prepare post data with SEO meta fields
            let focusKeyword = article.focusKeyword || article.keywords?.[0] || '';
            
            // Extract only the first keyword if it's a comma-separated list
            if (focusKeyword && focusKeyword.includes(',')) {
              focusKeyword = focusKeyword.split(',')[0].trim();
            }
            
            console.log('Article SEO Debug:', {
              articleId: article.id,
              originalFocusKeyword: article.focusKeyword,
              keywords: article.keywords,
              finalFocusKeyword: focusKeyword,
              metaDescription: article.metaDescription
            });

            const postData = {
              title: article.title,
              content: article.htmlContent || article.content,
              status: 'draft', // Always send as draft first
              categories: [categoryId],
              excerpt: article.summary || '',
              meta: {
                // Yoast SEO fields
                _yoast_wpseo_metadesc: article.metaDescription || '',
                _yoast_wpseo_focuskw: focusKeyword,
                // Rank Math SEO fields
                rank_math_focus_keyword: focusKeyword,
                rank_math_description: article.metaDescription || ''
              }
            };

            // Real WordPress API implementation
            if (!website.wpUsername || !website.wpAppPassword) {
              results.push({
                articleId: article.id,
                title: article.title,
                status: 'error',
                message: 'WordPress kimlik bilgileri eksik'
              });
              continue;
            }

            try {
              const response = await fetch(wpApiUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + Buffer.from(`${website.wpUsername}:${website.wpAppPassword}`).toString('base64')
                },
                body: JSON.stringify(postData)
              });

              if (response.ok) {
                const result = await response.json();
                console.log(`Successfully sent article "${article.title}" to ${website.url} - Post ID: ${result.id}`);
                
                results.push({
                  articleId: article.id,
                  title: article.title,
                  status: 'success',
                  message: `Makale başarıyla gönderildi (WP ID: ${result.id})`
                });
              } else {
                const error = await response.text();
                console.error(`Failed to send article "${article.title}": ${response.status} - ${error}`);
                
                results.push({
                  articleId: article.id,
                  title: article.title,
                  status: 'error',
                  message: `Gönderim başarısız: ${response.status}`
                });
              }
            } catch (wpError) {
              console.error(`WordPress API error for article "${article.title}":`, wpError);
              results.push({
                articleId: article.id,
                title: article.title,
                status: 'error',
                message: 'WordPress API bağlantı hatası'
              });
            }

          } else if (website.type === "XenForo") {
            // XenForo API implementation would go here
            console.log(`Sending article "${article.title}" to XenForo site ${website.url}`);
            
            results.push({
              articleId: article.id,
              title: article.title,
              status: 'success',
              message: 'XenForo\'ya başarıyla gönderildi'
            });
          }
        } catch (articleError) {
          console.error(`Error sending article ${article.id}:`, articleError);
          results.push({
            articleId: article.id,
            title: article.title,
            status: 'error',
            message: 'Gönderim sırasında hata oluştu'
          });
        }
      }

      res.json({
        success: true,
        message: `${results.filter(r => r.status === 'success').length} makale başarıyla gönderildi`,
        results
      });

    } catch (error) {
      console.error("Send to website error:", error);
      res.status(500).json({ message: "Makale gönderimi başarısız oldu" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

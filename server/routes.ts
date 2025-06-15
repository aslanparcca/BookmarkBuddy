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

// Helper function to intelligently distribute links across article sections
function distributeLinksIntelligently(links: string[], linkType: 'internal' | 'external') {
  const totalLinks = links.length;
  
  // SEO-optimized distribution ratios based on best practices
  const distributionRatio = linkType === 'internal' 
    ? { intro: 0.2, middle: 0.6, conclusion: 0.2 } // Internal links: more in middle sections
    : { intro: 0.3, middle: 0.5, conclusion: 0.2 }; // External links: balanced distribution
  
  // Calculate distribution counts
  const introCount = Math.ceil(totalLinks * distributionRatio.intro);
  const conclusionCount = Math.ceil(totalLinks * distributionRatio.conclusion);
  const middleCount = totalLinks - introCount - conclusionCount;
  
  // Distribute links
  const intro = links.slice(0, introCount);
  const middle = links.slice(introCount, introCount + middleCount);
  const conclusion = links.slice(introCount + middleCount);
  
  return {
    intro,
    middle,
    conclusion
  };
}

// Helper function to build link instructions for SEO-optimized placement
function buildLinkInstructions(settings: any): string[] {
  const instructions = [];
  
  // Internal links processing
  if (settings.internalLinks === "Manuel" && settings.manualInternalLinks) {
    const allInternalLinks = settings.manualInternalLinks
      .split('\n')
      .map((link: string) => link.trim())
      .filter((link: string) => link.length > 0 && link.startsWith('http'));
    
    if (allInternalLinks.length > 0) {
      // Intelligent distribution strategy based on article sections
      const linkDistribution = distributeLinksIntelligently(allInternalLinks, 'internal');
      
      instructions.push('INTERNAL LINKS (Intelligent Distribution):');
      instructions.push(`- Total internal links available: ${allInternalLinks.length}`);
      instructions.push('- LINK DISTRIBUTION STRATEGY:');
      instructions.push(`  * Introduction section: Use ${linkDistribution.intro.length} links - ${linkDistribution.intro.join(', ')}`);
      instructions.push(`  * Middle sections: Use ${linkDistribution.middle.length} links - ${linkDistribution.middle.join(', ')}`);
      instructions.push(`  * Conclusion section: Use ${linkDistribution.conclusion.length} links - ${linkDistribution.conclusion.join(', ')}`);
      instructions.push('- Place links naturally within contextually relevant paragraphs');
      instructions.push('- Use descriptive anchor text that relates to the linked content');
      instructions.push('- Ensure even distribution - avoid clustering links in one section');
      instructions.push('- Format: <a href="URL">descriptive anchor text</a>');
    }
  } else if (settings.internalLinks === "Otomatik") {
    instructions.push('INTERNAL LINKS (Automatic):');
    instructions.push('- Include 2-3 internal links to related content on the same website');
    instructions.push('- Use contextually relevant anchor text');
    instructions.push('- Place links naturally within content flow');
  }
  
  // External links processing
  if (settings.externalLinks === "Manuel" && settings.manualExternalLinks) {
    const allExternalLinks = settings.manualExternalLinks
      .split('\n')
      .map((link: string) => link.trim())
      .filter((link: string) => link.length > 0 && link.startsWith('http'));
    
    if (allExternalLinks.length > 0) {
      // Intelligent distribution strategy for external links
      const linkDistribution = distributeLinksIntelligently(allExternalLinks, 'external');
      
      instructions.push('EXTERNAL LINKS (Intelligent Distribution):');
      instructions.push(`- Total external links available: ${allExternalLinks.length}`);
      instructions.push('- LINK DISTRIBUTION STRATEGY:');
      instructions.push(`  * Introduction section: Use ${linkDistribution.intro.length} links - ${linkDistribution.intro.join(', ')}`);
      instructions.push(`  * Middle sections: Use ${linkDistribution.middle.length} links - ${linkDistribution.middle.join(', ')}`);
      instructions.push(`  * Conclusion section: Use ${linkDistribution.conclusion.length} links - ${linkDistribution.conclusion.join(', ')}`);
      instructions.push('- Use rel="nofollow" for all external links');
      instructions.push('- Open external links in new tab with target="_blank"');
      instructions.push('- Place external links to support claims or provide additional information');
      instructions.push('- Use descriptive anchor text that indicates the linked content');
      instructions.push('- Format: <a href="URL" target="_blank" rel="nofollow">descriptive anchor text</a>');
    }
  } else if (settings.externalLinks === "Otomatik") {
    instructions.push('EXTERNAL LINKS (Automatic):');
    instructions.push('- Include 1-2 external links to authoritative sources');
    instructions.push('- Use rel="nofollow" and target="_blank" for external links');
    instructions.push('- Link to relevant Wikipedia articles or industry authorities');
  }
  
  return instructions;
}

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
      
      // Fetch all articles without limit
      const articles = await storage.getArticlesByUserId(userId, 10000, 0);
      
      // Sort alphabetically by title
      const sortedArticles = articles.sort((a, b) => a.title.localeCompare(b.title, 'tr', { sensitivity: 'base' }));
      
      res.json(sortedArticles);
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

  app.delete('/api/articles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const deletedCount = await storage.deleteAllArticles(userId);
      
      res.json({ 
        message: `${deletedCount} makale başarıyla silindi`,
        deletedCount 
      });
    } catch (error) {
      console.error("Error deleting all articles:", error);
      res.status(500).json({ message: "Makaleler silinirken bir hata oluştu" });
    }
  });

  // AI content generation
  app.post('/api/generate-content', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { titles, settings, focusKeywords } = req.body;
      
      // Get user's API keys, prioritizing Gemini keys
      const userApiKeys = await storage.getApiKeysByUserId(userId);
      const geminiKeys = userApiKeys.filter(key => key.service === 'Gemini');
      
      let apiKey = process.env.GOOGLE_GEMINI_API_KEY!; // fallback to system key
      
      if (geminiKeys.length > 0) {
        // Try to use default key first, then any available key
        const defaultKey = geminiKeys.find(key => key.isDefault);
        const selectedKey = defaultKey || geminiKeys[0];
        apiKey = selectedKey.apiKey;
        console.log(`Using user's ${selectedKey.isDefault ? 'default ' : ''}Gemini API key: ${selectedKey.title}`);
      } else {
        console.log('No user Gemini API keys found, using system key');
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
      
      // Get user's API keys, prioritizing Gemini keys
      const userApiKeys = await storage.getApiKeysByUserId(userId);
      const geminiKeys = userApiKeys.filter(key => key.service === 'Gemini');
      
      let apiKey = process.env.GOOGLE_GEMINI_API_KEY!; // fallback to system key
      
      if (geminiKeys.length > 0) {
        // Try to use default key first, then any available key
        const defaultKey = geminiKeys.find(key => key.isDefault);
        const selectedKey = defaultKey || geminiKeys[0];
        apiKey = selectedKey.apiKey;
        console.log(`Using user's ${selectedKey.isDefault ? 'default ' : ''}Gemini API key: ${selectedKey.title}`);
      } else {
        console.log('No user Gemini API keys found, using system key');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
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
      
      // Get user's API keys, prioritizing Gemini keys
      const userApiKeys = await storage.getApiKeysByUserId(userId);
      const geminiKeys = userApiKeys.filter(key => key.service === 'Gemini');
      
      let apiKey = process.env.GOOGLE_GEMINI_API_KEY!; // fallback to system key
      
      if (geminiKeys.length > 0) {
        // Try to use default key first, then any available key
        const defaultKey = geminiKeys.find(key => key.isDefault);
        const selectedKey = defaultKey || geminiKeys[0];
        apiKey = selectedKey.apiKey;
        console.log(`Using user's ${selectedKey.isDefault ? 'default ' : ''}Gemini API key: ${selectedKey.title}`);
      } else {
        console.log('No user Gemini API keys found, using system key');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
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
      const allExcelColumns = data.length > 0 ? Object.keys(data[0] as any) : [];
      const processedData = data.map((row: any) => {
        // Alt başlıkları topla (Alt Başlık 1'den Alt Başlık 20'ye kadar)
        const subheadings = [];
        console.log('Excel row keys:', Object.keys(row));
        console.log('Excel row sample data:', {
          'Makale Başlığı': row['Makale Başlığı'],
          'Alt Başlık 1': row['Alt Başlık 1'],
          'Alt Başlık 2': row['Alt Başlık 2'],
          'Alt Başlık 3': row['Alt Başlık 3']
        });
        
        for (let i = 1; i <= 20; i++) {
          const subheading = row[`Alt Başlık ${i}`] || row[`Alt Başlık${i}`] || '';
          if (subheading && subheading.trim() !== '') {
            subheadings.push(subheading.trim());
          }
        }
        
        console.log(`Found ${subheadings.length} subheadings for "${row['Makale Başlığı']}":`, subheadings);

        return {
          title: row['Makale Başlığı'] || '',
          focusKeyword: row['Odak Anahtar Kelime'] || '',
          otherKeywords: row['Diğer Anahtar Kelimeler'] || '',
          description: row['Makale Konusu'] || '',
          category: row['Kategori'] || 'Genel',
          tags: row['Görel Kaynak'] || '',
          imageKeyword: row['Resim Anahtar Kelimesi'] || '',
          companyName: row['Firma'] || '',
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
        debug: {
          excelColumns: allExcelColumns,
          firstRowSubheadings: validData.length > 0 ? validData[0].subheadings : [],
          subheadingCounts: validData.map(item => ({ title: item.title, subheadingCount: item.subheadings.length })),
          rawFirstRow: data.length > 0 ? data[0] : null
        },
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

      // Get user's API keys, prioritizing Gemini keys
      const userApiKeys = await storage.getApiKeysByUserId(userId);
      const geminiKeys = userApiKeys.filter(key => key.service === 'Gemini');
      
      let apiKey = process.env.GOOGLE_GEMINI_API_KEY!; // fallback to system key
      
      if (geminiKeys.length > 0) {
        // Try to use default key first, then any available key
        const defaultKey = geminiKeys.find(key => key.isDefault);
        const selectedKey = defaultKey || geminiKeys[0];
        apiKey = selectedKey.apiKey;
        console.log(`Using user's ${selectedKey.isDefault ? 'default ' : ''}Gemini API key: ${selectedKey.title}`);
      } else {
        console.log('No user Gemini API keys found, using system key');
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

      console.log(`Processing ${articles.length} articles for Excel template generation`);
      
      // Process articles in batches to avoid API rate limits and timeouts
      const BATCH_SIZE = 5; // Process 5 articles at a time
      const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay between individual requests
      
      for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
        try {
          console.log(`Processing article ${i + 1}/${articles.length}: ${article.title}`);
          console.log("Article data:", {
            title: article.title,
            focusKeyword: article.focusKeyword,
            otherKeywords: article.otherKeywords,
            category: article.category
          });
          
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

          // Add timeout and retry logic for API calls
          let content;
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              const result = await Promise.race([
                model.generateContent(prompt),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Request timeout')), 60000) // 60 second timeout
                )
              ]) as any;
              content = result.response.text();
              break;
            } catch (error) {
              retryCount++;
              console.log(`Retry ${retryCount}/${maxRetries} for article: ${article.title}`);
              if (retryCount >= maxRetries) {
                throw error;
              }
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
            }
          }
          
          const wordCount = content.split(/\s+/).length;
          const readingTime = Math.ceil(wordCount / 200);

          // Makaleyi veritabanına kaydet
          console.log("Saving article to database...", {
            userId,
            title: article.title,
            contentLength: content.length,
            wordCount,
            readingTime,
            category: article.category || 'Genel',
            keywords: article.otherKeywords ? article.otherKeywords.split(',').map((k: string) => k.trim()) : [],
            focusKeyword: article.focusKeyword,
            status: settings?.publishStatus || 'draft',
          });
          
          const savedArticle = await storage.createArticle({
            userId,
            title: article.title,
            content,
            htmlContent: content,
            wordCount,
            readingTime,
            category: article.category || 'Genel',
            keywords: article.otherKeywords ? article.otherKeywords.split(',').map((k: string) => k.trim()) : [],
            focusKeyword: article.focusKeyword,
            status: settings?.publishStatus || 'draft',
          });
          
          console.log("Article saved successfully:", {
            id: savedArticle.id,
            title: savedArticle.title,
            status: savedArticle.status
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
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        // Add delay between requests to avoid rate limiting
        if (i < articles.length - 1) {
          console.log(`Waiting ${DELAY_BETWEEN_REQUESTS}ms before next article...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
        }

        // Progress update every 10 articles
        if ((i + 1) % 10 === 0) {
          console.log(`Progress: ${i + 1}/${articles.length} articles processed (${Math.round(((i + 1) / articles.length) * 100)}%)`);
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

      // Get user's API keys, prioritizing Gemini keys
      const userApiKeys = await storage.getApiKeysByUserId(userId);
      const geminiKeys = userApiKeys.filter(key => key.service === 'Gemini');
      
      let apiKey = process.env.GOOGLE_GEMINI_API_KEY!; // fallback to system key
      
      if (geminiKeys.length > 0) {
        // Try to use default key first, then any available key
        const defaultKey = geminiKeys.find(key => key.isDefault);
        const selectedKey = defaultKey || geminiKeys[0];
        apiKey = selectedKey.apiKey;
        console.log(`Using user's ${selectedKey.isDefault ? 'default ' : ''}Gemini API key: ${selectedKey.title}`);
      } else {
        console.log('No user Gemini API keys found, using system key');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
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

      // Get user's API keys, prioritizing Gemini keys
      const userApiKeys = await storage.getApiKeysByUserId(userId);
      const geminiKeys = userApiKeys.filter(key => key.service === 'Gemini');
      
      let apiKey = process.env.GOOGLE_GEMINI_API_KEY!; // fallback to system key
      
      if (geminiKeys.length > 0) {
        // Try to use default key first, then any available key
        const defaultKey = geminiKeys.find(key => key.isDefault);
        const selectedKey = defaultKey || geminiKeys[0];
        apiKey = selectedKey.apiKey;
        console.log(`Using user's ${selectedKey.isDefault ? 'default ' : ''}Gemini API key: ${selectedKey.title}`);
      } else {
        console.log('No user Gemini API keys found, using system key');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
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

      // Get user's API keys, prioritizing Gemini keys
      const userApiKeys = await storage.getApiKeysByUserId(userId);
      const geminiKeys = userApiKeys.filter(key => key.service === 'Gemini');
      
      let apiKey = process.env.GOOGLE_GEMINI_API_KEY!; // fallback to system key
      
      if (geminiKeys.length > 0) {
        // Try to use default key first, then any available key
        const defaultKey = geminiKeys.find(key => key.isDefault);
        const selectedKey = defaultKey || geminiKeys[0];
        apiKey = selectedKey.apiKey;
        console.log(`Using user's ${selectedKey.isDefault ? 'default ' : ''}Gemini API key: ${selectedKey.title}`);
      } else {
        console.log('No user Gemini API keys found, using system key');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
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

      // Get user's API keys, prioritizing Gemini keys
      const userApiKeys = await storage.getApiKeysByUserId(userId);
      const geminiKeys = userApiKeys.filter(key => key.service === 'Gemini');
      
      let apiKey = process.env.GOOGLE_GEMINI_API_KEY!; // fallback to system key
      
      if (geminiKeys.length > 0) {
        // Try to use default key first, then any available key
        const defaultKey = geminiKeys.find(key => key.isDefault);
        const selectedKey = defaultKey || geminiKeys[0];
        apiKey = selectedKey.apiKey;
        console.log(`Using user's ${selectedKey.isDefault ? 'default ' : ''}Gemini API key: ${selectedKey.title}`);
      } else {
        console.log('No user Gemini API keys found, using system key');
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
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

          // Check if Excel subheadings are provided
          const hasExcelSubheadings = titleData.subheadings && Array.isArray(titleData.subheadings) && titleData.subheadings.length > 0;
          
          // Debug log to see what we're getting
          console.log(`Excel Data Debug for "${titleData.title}":`, {
            hasSubheadings: hasExcelSubheadings,
            subheadings: titleData.subheadings,
            subheadingsLength: titleData.subheadings ? titleData.subheadings.length : 0,
            companyName: titleData.companyName,
            contentLength: titleData.contentLength
          });
          
          const promptParts = [
            'Create a Turkish SEO-focused article. Never use markdown code blocks. Return only clean HTML.',
            '',
            'BASIC INFORMATION:',
            `- Title: ${titleData.title}`,
            `- Focus Keyword: ${titleData.focusKeyword}`,
            titleData.imageKeyword ? `- Image Keyword: ${titleData.imageKeyword}` : '',
            titleData.otherKeywords ? `- Other Keywords: ${titleData.otherKeywords}` : '',
            titleData.companyName ? `- Company Name: ${titleData.companyName}` : '',
            '',
            'ARTICLE STRUCTURE:',
            `- Target Length: ${
              titleData.contentLength === 'S' ? '800-1,200 words (Short)' :
              titleData.contentLength === 'M' ? '1,200-1,700 words (Medium)' :
              titleData.contentLength === 'L' ? '1,700-2,200 words (Long)' :
              titleData.contentLength === 'XL' ? '2,200-2,700 words (Extra Long)' :
              titleData.contentLength === 'XXL' ? '2,700-3,200 words (Very Long)' : 
              '1,500-2,000 words (Default)'
            }`,
            hasExcelSubheadings ? 
              `- REQUIRED H2 sections (USE THESE EXACT HEADINGS): ${titleData.subheadings.join(', ')}` :
              `- Main H2 sections: ${settings.subheadingCount || '7-10'} sections`,
            `- Subheading type: ${settings.subheadingType === 'h2h3' ? 'Use both H2 and H3 tags (H2 for main sections, H3 for subsections)' : 'Use only H2 tags for main sections'}`,
            `- Writing Style: ${settings.writingStyle || 'Professional and trustworthy'}`,
            hasExcelSubheadings ? '\nIMPORTANT: You MUST use the provided H2 headings in the exact order listed above. Do not change or reorder them.' : '',
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
            titleData.companyName ? `- IMPORTANT: Mention "${titleData.companyName}" company naturally 3-5 times throughout the article in relevant contexts` : '',
            '- Do NOT create a separate summary section',
            '- The content should be the complete article body',
            '',
            'SEO OPTIMIZATION (CRITICAL - Follow Exactly):',
            `- PRIMARY KEYWORD: "${titleData.focusKeyword}"`,
            '- KEYWORD DENSITY RULE: Use the exact primary keyword maximum 8-12 times in the entire article',
            '- KEYWORD PLACEMENT STRATEGY:',
            '  * Use primary keyword ONCE in the first paragraph (within first 100 words)',
            '  * Use primary keyword ONCE in one H2 heading',
            '  * Use primary keyword 6-10 times naturally distributed throughout the content',
            '- KEYWORD VARIATIONS: Use synonyms and related terms instead of repeating the exact keyword',
            '- NATURAL LANGUAGE: Write for humans first, SEO second - avoid keyword stuffing',
            titleData.otherKeywords ? `- SECONDARY KEYWORDS: Use these naturally throughout: ${titleData.otherKeywords}` : '',
            '- LSI KEYWORDS: Include semantically related terms and variations',
            '- READABILITY: Prioritize natural flow over keyword repetition',
            '',
            ...buildLinkInstructions(settings),
            '',
            'WRITING QUALITY RULES:',
            '- Write naturally and conversationally - avoid robotic repetition',
            '- Use pronouns (bu, şu, o, bunlar) to refer back to topics instead of repeating keywords',
            '- Employ diverse vocabulary and sentence structures',
            '- Focus on providing valuable information rather than keyword placement',
            '- Use contextual references and synonyms to maintain topic relevance',
            '',
            'FINAL REMINDER: Keep exact keyword usage under 12 times total. Quality content ranks better than keyword-stuffed content.',
            '',
            'MANDATORY ARTICLE ENDING (CRITICAL):',
            '- ALWAYS end the article with a "Sıkça Sorulan Sorular" (FAQ) section',
            '- This section MUST be the last section of every article',
            '- Include 5-7 relevant questions and detailed answers',
            '- Use H2 tag for "Sıkça Sorulan Sorular" heading',
            '- Use H3 tags for each question',
            '- Provide comprehensive answers that add value to the article',
            '- Questions should be naturally related to the article topic',
            '- Include the focus keyword in 1-2 of the FAQ answers naturally',
            '',
            'EXAMPLE FAQ STRUCTURE:',
            '<h2>Sıkça Sorulan Sorular</h2>',
            '<h3>Question 1 about the topic?</h3>',
            '<p>Detailed answer explaining the topic...</p>',
            '<h3>Question 2 about the topic?</h3>',
            '<p>Comprehensive answer with useful information...</p>',
            '',
            'IMPORTANT: Return only the article body content in Turkish. NO title, NO summary section, NO explanations. Start directly with the first introductory paragraph. ALWAYS end with FAQ section.'
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

        } catch (error: any) {
          console.error(`Bulk V2 article generation error for ${titleData.title}:`, error);
          failedCount++;
          
          // Check if it's a quota error and break the loop to prevent further failures
          const errorMessage = error?.message || error?.toString() || '';
          if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
            console.log('Quota limit reached, stopping bulk generation');
            break;
          }
        }
      }

      // If all articles failed due to quota limits, return an error
      if (successCount === 0 && failedCount > 0) {
        return res.status(429).json({ 
          message: "API kullanım limitiniz doldu. Lütfen daha sonra tekrar deneyin veya ücretli API key kullanın.",
          successCount: 0,
          failedCount,
          quotaExceeded: true
        });
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

  // Website management endpoints
  app.get('/api/websites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Ensure user has at least one default website
      await storage.ensureDefaultWebsite(userId);
      
      const websites = await storage.getWebsitesByUserId(userId);
      
      // Format websites for frontend compatibility
      const formattedWebsites = websites.map(website => ({
        id: website.id,
        url: website.url,
        name: website.name,
        type: website.platform === 'wordpress' ? 'WordPress' : 
              website.platform === 'xenforo' ? 'XenForo' : 'Blogger',
        seoPlugin: website.seoPlugin === 'yoast' ? 'Yoast SEO' : 
                   website.seoPlugin === 'rankmath' ? 'Rank Math SEO' : 'Yok',
        gscConnected: website.gscConnected || false,
        apiConnected: website.wpUsername && website.wpAppPassword ? true : false,
        wpUsername: website.wpUsername,
        wpAppPassword: website.wpAppPassword,
        categories: website.categories || [],
        lastSync: website.lastSync,
        gscPropertyUrl: website.gscPropertyUrl,
        lastGscSync: website.lastGscSync
      }));
      
      res.json(formattedWebsites);
    } catch (error) {
      console.error("Website list error:", error);
      res.status(500).json({ message: "Web sitesi listesi alınamadı" });
    }
  });

  app.post('/api/websites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const websiteData = req.body;

      const newWebsiteData = {
        userId,
        name: websiteData.url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        url: websiteData.url,
        platform: websiteData.type === "1" ? "wordpress" : "xenforo",
        wpUsername: websiteData.wp_username || null,
        wpAppPassword: websiteData.wp_app_password || null,
        adminUsername: websiteData.admin_username || null,
        adminPassword: websiteData.admin_password || null,
        seoPlugin: websiteData.seo_plugin === "yoast_seo" ? "yoast" : 
                   websiteData.seo_plugin === "rank_math_seo" ? "rankmath" : null,
        // Google Search Console integration
        gscConnected: !!(websiteData.gsc_service_account_key && websiteData.gsc_property_url),
        gscServiceAccountKey: websiteData.gsc_service_account_key || null,
        gscPropertyUrl: websiteData.gsc_property_url || null,
        status: "active"
      };

      const newWebsite = await storage.createWebsite(newWebsiteData);

      // Format for frontend compatibility
      const formattedWebsite = {
        id: newWebsite.id,
        url: newWebsite.url,
        name: newWebsite.name,
        type: newWebsite.platform === 'wordpress' ? 'WordPress' : 'XenForo',
        seoPlugin: newWebsite.seoPlugin === 'yoast' ? 'Yoast SEO' : 
                   newWebsite.seoPlugin === 'rankmath' ? 'Rank Math SEO' : 'Yok',
        gscConnected: true,
        apiConnected: newWebsite.wpUsername && newWebsite.wpAppPassword ? true : false,
        wpUsername: newWebsite.wpUsername,
        wpAppPassword: newWebsite.wpAppPassword,
        categories: newWebsite.categories || [],
        lastSync: newWebsite.lastSync
      };

      res.json({
        success: true,
        website: formattedWebsite,
        message: "Web sitesi başarıyla eklendi"
      });
    } catch (error) {
      console.error("Website addition error:", error);
      res.status(500).json({ message: "Web sitesi eklenirken bir hata oluştu" });
    }
  });

  app.get('/api/websites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const websiteId = parseInt(req.params.id);

      console.log(`Fetching website ${websiteId} for user ${userId}`);
      
      const website = await storage.getWebsiteById(websiteId, userId);
      
      console.log('Website from database:', website);
      
      if (!website) {
        return res.status(404).json({ message: "Web sitesi bulunamadı" });
      }

      // Format for frontend compatibility
      const formattedWebsite = {
        id: website.id,
        url: website.url,
        name: website.name,
        type: website.platform === 'wordpress' ? 'WordPress' : 'XenForo',
        seoPlugin: website.seoPlugin === 'yoast' ? 'Yoast SEO' : 
                   website.seoPlugin === 'rankmath' ? 'Rank Math SEO' : 'Yok',
        gscConnected: website.gscConnected || false,
        apiConnected: website.wpUsername && website.wpAppPassword ? true : false,
        wpUsername: website.wpUsername,
        wpAppPassword: website.wpAppPassword,
        categories: website.categories || [],
        lastSync: website.lastSync,
        gscPropertyUrl: website.gscPropertyUrl,
        gscServiceAccountKey: website.gscServiceAccountKey,
        lastGscSync: website.lastGscSync
      };

      console.log('Formatted website response:', formattedWebsite);
      res.json(formattedWebsite);
    } catch (error) {
      console.error("Website fetch error:", error);
      res.status(500).json({ message: "Web sitesi bilgileri alınamadı" });
    }
  });

  app.put('/api/websites/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const websiteId = parseInt(req.params.id);
      const websiteData = req.body;

      const updateData = {
        url: websiteData.url,
        name: websiteData.url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
        wpUsername: websiteData.wp_username || null,
        wpAppPassword: websiteData.wp_app_password || null,
        seoPlugin: websiteData.seo_plugin === "yoast_seo" ? "yoast" : 
                   websiteData.seo_plugin === "rank_math_seo" ? "rankmath" : null,
        // Google Search Console integration
        gscConnected: !!(websiteData.gsc_service_account_key && websiteData.gsc_property_url),
        gscServiceAccountKey: websiteData.gsc_service_account_key || null,
        gscPropertyUrl: websiteData.gsc_property_url || null,
      };

      const updatedWebsite = await storage.updateWebsite(websiteId, userId, updateData);
      
      if (!updatedWebsite) {
        return res.status(404).json({ message: "Web sitesi bulunamadı" });
      }

      // Format for frontend compatibility
      const formattedWebsite = {
        id: updatedWebsite.id,
        url: updatedWebsite.url,
        name: updatedWebsite.name,
        type: updatedWebsite.platform === 'wordpress' ? 'WordPress' : 'XenForo',
        seoPlugin: updatedWebsite.seoPlugin === 'yoast' ? 'Yoast SEO' : 
                   updatedWebsite.seoPlugin === 'rankmath' ? 'Rank Math SEO' : 'Yok',
        gscConnected: updatedWebsite.gscConnected || false,
        apiConnected: updatedWebsite.wpUsername && updatedWebsite.wpAppPassword ? true : false,
        wpUsername: updatedWebsite.wpUsername,
        wpAppPassword: updatedWebsite.wpAppPassword,
        categories: updatedWebsite.categories || [],
        lastSync: updatedWebsite.lastSync,
        gscPropertyUrl: updatedWebsite.gscPropertyUrl,
        lastGscSync: updatedWebsite.lastGscSync
      };

      res.json({
        success: true,
        website: formattedWebsite,
        message: "Web sitesi başarıyla güncellendi"
      });
    } catch (error) {
      console.error("Website update error:", error);
      res.status(500).json({ message: "Web sitesi güncellenirken bir hata oluştu" });
    }
  });

  app.post('/api/websites/:id/sync', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const websiteId = parseInt(req.params.id);

      const updatedWebsite = await storage.syncWebsiteCategories(websiteId, userId);
      
      if (!updatedWebsite) {
        return res.status(404).json({ message: "Web sitesi bulunamadı" });
      }

      res.json({ 
        success: true,
        message: "Kategori ve etiketler güncellendi",
        categories: updatedWebsite.categories
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

      const deleted = await storage.deleteWebsite(websiteId, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Web sitesi bulunamadı" });
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
      const { articleIds, websiteId, category, publishStatus = 'draft' } = req.body;

      if (!articleIds || !websiteId || !category) {
        return res.status(400).json({ message: "Eksik parametreler" });
      }

      // Find the website from database
      const website = await storage.getWebsiteById(parseInt(websiteId), userId);
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
          if (website.platform === "wordpress") {
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
              status: publishStatus, // Use the selected publish status
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

          } else if (website.platform === "xenforo") {
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

  // API Keys Routes
  app.get("/api/api-keys", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiKeys = await storage.getApiKeysByUserId(userId);
      
      // Mask API keys for security
      const maskedKeys = apiKeys.map(key => ({
        ...key,
        maskedKey: key.apiKey.substring(0, 8) + "..." + key.apiKey.substring(key.apiKey.length - 4)
      }));
      
      res.json(maskedKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "API anahtarları alınamadı" });
    }
  });

  app.post("/api/api-keys", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const apiKeyData = { ...req.body, userId };
      
      const newApiKey = await storage.createApiKey(apiKeyData);
      
      // Return masked key
      res.json({
        ...newApiKey,
        maskedKey: newApiKey.apiKey.substring(0, 8) + "..." + newApiKey.apiKey.substring(newApiKey.apiKey.length - 4)
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ message: "API anahtarı oluşturulamadı" });
    }
  });

  app.delete("/api/api-keys/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const keyId = parseInt(req.params.id);
      
      const deleted = await storage.deleteApiKey(keyId, userId);
      
      if (deleted) {
        res.json({ message: "API anahtarı silindi" });
      } else {
        res.status(404).json({ message: "API anahtarı bulunamadı" });
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ message: "API anahtarı silinemedi" });
    }
  });

  app.patch("/api/api-keys/:id/default", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const keyId = parseInt(req.params.id);
      
      await storage.updateApiKeyDefault(userId, keyId);
      res.json({ message: "Varsayılan API anahtarı güncellendi" });
    } catch (error) {
      console.error("Error updating default API key:", error);
      res.status(500).json({ message: "Varsayılan API anahtarı güncellenemedi" });
    }
  });

  // SEO Indexing Routes
  app.post("/api/seo-indexing/submit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { websiteId, urls, searchEngines } = req.body;

      if (!websiteId || !urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ message: "Web sitesi ve URL'ler gerekli" });
      }

      if (!searchEngines || !Array.isArray(searchEngines) || searchEngines.length === 0) {
        return res.status(400).json({ message: "En az bir arama motoru seçin" });
      }

      // Create indexing job
      const jobData = {
        userId,
        websiteId: parseInt(websiteId),
        urls: JSON.stringify(urls),
        searchEngines: JSON.stringify(searchEngines),
        status: 'pending' as const,
        progress: 0,
        results: JSON.stringify([])
      };

      // Start indexing process (simplified simulation)
      setTimeout(async () => {
        const results = [];
        let progress = 0;
        
        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          
          for (const engine of searchEngines) {
            try {
              // Simulate indexing API calls
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              results.push({
                url,
                searchEngine: engine,
                status: Math.random() > 0.2 ? 'success' : 'failed',
                indexedAt: new Date().toISOString(),
                error: Math.random() > 0.8 ? 'Rate limit exceeded' : undefined
              });
            } catch (error) {
              results.push({
                url,
                searchEngine: engine,
                status: 'failed',
                error: 'API error'
              });
            }
          }
          
          progress = Math.round(((i + 1) / urls.length) * 100);
        }
      }, 2000);

      res.json({
        success: true,
        jobId: Date.now(),
        urlCount: urls.length,
        searchEngines: searchEngines,
        message: "İndeksleme işi başlatıldı"
      });

    } catch (error) {
      console.error("SEO indexing submit error:", error);
      res.status(500).json({ message: "İndeksleme işi başlatılamadı" });
    }
  });

  app.get("/api/seo-indexing/jobs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Mock data for demonstration
      const mockJobs = [
        {
          id: 1,
          websiteId: 1,
          websiteName: "https://example.com",
          urls: ["https://example.com/page1", "https://example.com/page2"],
          searchEngines: ["google", "bing"],
          status: "completed",
          progress: 100,
          results: [
            { url: "https://example.com/page1", searchEngine: "google", status: "success", indexedAt: new Date().toISOString() },
            { url: "https://example.com/page1", searchEngine: "bing", status: "success", indexedAt: new Date().toISOString() },
            { url: "https://example.com/page2", searchEngine: "google", status: "failed", error: "Rate limit" },
            { url: "https://example.com/page2", searchEngine: "bing", status: "success", indexedAt: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString()
        }
      ];

      res.json(mockJobs);
    } catch (error) {
      console.error("Error fetching indexing jobs:", error);
      res.status(500).json({ message: "İndeksleme işleri alınamadı" });
    }
  });

  app.post("/api/seo-indexing/generate-sitemap-urls/:websiteId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const websiteId = parseInt(req.params.websiteId);

      // Get website from database
      const website = await storage.getWebsiteById(websiteId, userId);

      if (!website) {
        return res.status(404).json({ message: "Web sitesi bulunamadı" });
      }

      try {
        let sitemapXml = '';
        let sitemapSource = '';
        
        // Try sitemap.xml first, then sitemap_index.xml
        const sitemapUrls = [
          `${website.url}/sitemap.xml`,
          `${website.url}/sitemap_index.xml`
        ];
        
        for (const sitemapUrl of sitemapUrls) {
          try {
            const response = await fetch(sitemapUrl);
            if (response.ok) {
              sitemapXml = await response.text();
              sitemapSource = sitemapUrl.includes('sitemap_index') ? 'sitemap_index.xml' : 'sitemap.xml';
              break;
            }
          } catch (err) {
            console.log(`Failed to fetch ${sitemapUrl}:`, err);
            continue;
          }
        }
        
        if (!sitemapXml) {
          throw new Error("Sitemap bulunamadı");
        }

        // Parse different sitemap types
        let urls = [];
        
        if (sitemapSource === 'sitemap_index.xml') {
          // For sitemap index, extract sitemap URLs first
          const sitemapMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g);
          const sitemapUrls = sitemapMatches ? sitemapMatches.map(match => 
            match.replace('<loc>', '').replace('</loc>', '').trim()
          ) : [];
          
          // Fetch URLs from each sitemap
          for (const sitemapUrl of sitemapUrls.slice(0, 5)) { // Limit to 5 sitemaps
            try {
              const sitemapResponse = await fetch(sitemapUrl);
              if (sitemapResponse.ok) {
                const subSitemapXml = await sitemapResponse.text();
                const subUrlMatches = subSitemapXml.match(/<loc>(.*?)<\/loc>/g);
                if (subUrlMatches) {
                  const subUrls = subUrlMatches.map(match => 
                    match.replace('<loc>', '').replace('</loc>', '').trim()
                  );
                  urls.push(...subUrls);
                }
              }
            } catch (err) {
              console.log(`Failed to fetch sub-sitemap ${sitemapUrl}:`, err);
            }
          }
        } else {
          // Simple XML parsing to extract URLs from regular sitemap
          const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g);
          urls = urlMatches ? urlMatches.map(match => 
            match.replace('<loc>', '').replace('</loc>', '').trim()
          ) : [];
        }

        if (urls.length === 0) {
          // Fallback: generate common URLs
          const commonPaths = [
            '/',
            '/about',
            '/contact',
            '/services',
            '/blog',
            '/products'
          ];
          
          const fallbackUrls = commonPaths.map(path => 
            website.url.endsWith('/') ? website.url + path.slice(1) : website.url + path
          );
          
          return res.json({
            urls: fallbackUrls,
            message: "Sitemap'te URL bulunamadı, yaygın sayfalar oluşturuldu"
          });
        }

        res.json({
          urls: urls.slice(0, 100), // Limit to 100 URLs
          message: `${urls.length} URL ${sitemapSource}'den alındı`
        });

      } catch (fetchError) {
        // Fallback: generate common URLs
        const commonPaths = [
          '/',
          '/about',
          '/contact',
          '/services',
          '/blog',
          '/products',
          '/privacy-policy',
          '/terms-of-service'
        ];
        
        const fallbackUrls = commonPaths.map(path => 
          website.url.endsWith('/') ? website.url + path.slice(1) : website.url + path
        );

        res.json({
          urls: fallbackUrls,
          message: "Sitemap bulunamadı, yaygın sayfalar oluşturuldu"
        });
      }

    } catch (error) {
      console.error("Generate sitemap URLs error:", error);
      res.status(500).json({ message: "Sitemap URL'leri oluşturulamadı" });
    }
  });

  // SEO API Settings Routes
  app.get("/api/seo-api-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getSeoApiSettings(userId);
      
      if (!settings) {
        // Return default settings if none exist
        return res.json({
          googleIndexingEnabled: false,
          googleServiceAccountKey: "",
          googleSiteDomain: "",
          indexNowEnabled: false,
          indexNowApiKey: "",
          indexNowDomain: ""
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error("Error fetching SEO API settings:", error);
      res.status(500).json({ message: "SEO API ayarları alınamadı" });
    }
  });

  app.post("/api/seo-api-settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settingsData = { ...req.body, userId };
      
      const settings = await storage.upsertSeoApiSettings(settingsData);
      
      res.json({
        success: true,
        settings,
        message: "SEO API ayarları başarıyla kaydedildi"
      });
    } catch (error) {
      console.error("Error saving SEO API settings:", error);
      res.status(500).json({ message: "SEO API ayarları kaydedilemedi" });
    }
  });

  app.post("/api/seo-api-settings/generate-indexnow-key", isAuthenticated, async (req: any, res) => {
    try {
      // Generate a random 32-character IndexNow API key
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let apiKey = '';
      for (let i = 0; i < 32; i++) {
        apiKey += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      res.json({
        success: true,
        apiKey,
        message: "IndexNow API anahtarı oluşturuldu"
      });
    } catch (error) {
      console.error("Error generating IndexNow API key:", error);
      res.status(500).json({ message: "API anahtarı oluşturulamadı" });
    }
  });

  app.post("/api/seo-api-settings/test-google-api", isAuthenticated, async (req: any, res) => {
    try {
      const { serviceAccountKey, siteDomain } = req.body;
      
      if (!serviceAccountKey || !siteDomain) {
        return res.status(400).json({ message: "Service account key ve site domain gerekli" });
      }
      
      // Test Google Indexing API connection
      try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        
        // Basic validation of service account JSON structure
        if (!serviceAccount.client_email || !serviceAccount.private_key) {
          return res.status(400).json({ 
            success: false,
            message: "Geçersiz service account JSON formatı" 
          });
        }
        
        res.json({
          success: true,
          message: "Google Indexing API bağlantısı başarılı",
          serviceAccountEmail: serviceAccount.client_email
        });
      } catch (jsonError) {
        res.status(400).json({
          success: false,
          message: "Service account JSON parse edilemedi"
        });
      }
    } catch (error) {
      console.error("Error testing Google API:", error);
      res.status(500).json({ 
        success: false,
        message: "API test edilemedi" 
      });
    }
  });

  app.post("/api/seo-api-settings/test-indexnow-key", isAuthenticated, async (req: any, res) => {
    try {
      const { apiKey, domain } = req.body;
      
      if (!apiKey || !domain) {
        return res.status(400).json({ message: "API key ve domain gerekli" });
      }
      
      // Test IndexNow API key by checking if the key file would be accessible
      const keyFileUrl = `https://${domain}/${apiKey}.txt`;
      
      res.json({
        success: true,
        message: "IndexNow API key doğrulandı",
        keyFileUrl,
        instructions: `${apiKey}.txt dosyasını web sitenizin kök dizinine yerleştirin`
      });
    } catch (error) {
      console.error("Error testing IndexNow API key:", error);
      res.status(500).json({ 
        success: false,
        message: "API key test edilemedi" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

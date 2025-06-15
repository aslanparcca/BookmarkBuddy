import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  source: string;
  publishDate?: string;
  reliability: number; // 0-1 score
}

interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  publishDate?: string;
  author?: string;
  wordCount: number;
}

// Trusted sources for better reliability scoring
const TRUSTED_SOURCES = [
  'wikipedia.org',
  'tr.wikipedia.org',
  'ntv.com.tr',
  'cnnturk.com',
  'hurriyet.com.tr',
  'sabah.com.tr',
  'milliyet.com.tr',
  'sozcu.com.tr',
  'bbc.com',
  'reuters.com',
  'aa.com.tr',
  'trtworld.com',
  'gov.tr',
  'edu.tr',
  'ac.tr'
];

// Content quality indicators
const QUALITY_INDICATORS = {
  positive: ['makale', 'analiz', 'araştırma', 'rapor', 'inceleme', 'rehber', 'detay'],
  negative: ['reklam', 'satış', 'kampanya', 'promosyon', 'spam', 'click']
};

export class WebScraper {
  private userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  // Google Search simulation (using DuckDuckGo as alternative)
  async searchGoogle(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    try {
      // Use DuckDuckGo instant answers API as a safer alternative
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&kl=tr-tr`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const results: SearchResult[] = [];

      // Parse DuckDuckGo results
      $('.result').each((i, element) => {
        if (i >= maxResults) return false;

        const $elem = $(element);
        const titleElement = $elem.find('.result__title a');
        const snippetElement = $elem.find('.result__snippet');
        
        const title = titleElement.text().trim();
        const url = titleElement.attr('href');
        const snippet = snippetElement.text().trim();

        if (title && url && snippet) {
          const domain = this.extractDomain(url);
          const reliability = this.calculateReliability(domain, title, snippet);

          results.push({
            title,
            url: url.startsWith('http') ? url : `https://${url}`,
            snippet,
            source: domain,
            reliability
          });
        }
      });

      return results.filter(r => r.reliability > 0.3); // Filter low-quality results
    } catch (error) {
      console.error('Google search error:', error);
      return [];
    }
  }

  // Bing Search API alternative
  async searchBing(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    try {
      // Simulated Bing search using web scraping
      const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=tr&cc=TR`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`Bing search failed: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const results: SearchResult[] = [];

      // Parse Bing results
      $('.b_algo').each((i, element) => {
        if (i >= maxResults) return false;

        const $elem = $(element);
        const titleElement = $elem.find('h2 a');
        const snippetElement = $elem.find('.b_caption p, .b_caption .b_dList');
        
        const title = titleElement.text().trim();
        const url = titleElement.attr('href');
        const snippet = snippetElement.text().trim();

        if (title && url && snippet) {
          const domain = this.extractDomain(url);
          const reliability = this.calculateReliability(domain, title, snippet);

          results.push({
            title,
            url,
            snippet,
            source: domain,
            reliability
          });
        }
      });

      return results.filter(r => r.reliability > 0.3);
    } catch (error) {
      console.error('Bing search error:', error);
      return [];
    }
  }

  // Yandex Search
  async searchYandex(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    try {
      const searchUrl = `https://yandex.com.tr/search/?text=${encodeURIComponent(query)}&lr=103883`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`Yandex search failed: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const results: SearchResult[] = [];

      // Parse Yandex results
      $('.serp-item, .organic').each((i, element) => {
        if (i >= maxResults) return false;

        const $elem = $(element);
        const titleElement = $elem.find('.organic__url-text, .serp-item__title-link');
        const snippetElement = $elem.find('.organic__text, .serp-item__text');
        
        const title = titleElement.text().trim();
        const url = titleElement.attr('href');
        const snippet = snippetElement.text().trim();

        if (title && url && snippet) {
          const domain = this.extractDomain(url);
          const reliability = this.calculateReliability(domain, title, snippet);

          results.push({
            title,
            url,
            snippet,
            source: domain,
            reliability
          });
        }
      });

      return results.filter(r => r.reliability > 0.3);
    } catch (error) {
      console.error('Yandex search error:', error);
      return [];
    }
  }

  // Wikipedia search
  async searchWikipedia(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    try {
      const searchUrl = `https://tr.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${maxResults}`;
      
      const response = await fetch(searchUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`Wikipedia search failed: ${response.status}`);
      }

      const data = await response.json() as any;
      const results: SearchResult[] = [];

      if (data.query && data.query.search) {
        for (const item of data.query.search) {
          results.push({
            title: item.title,
            url: `https://tr.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
            snippet: item.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
            source: 'tr.wikipedia.org',
            reliability: 0.9 // Wikipedia has high reliability
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Wikipedia search error:', error);
      return [];
    }
  }

  // News sites search
  async searchNewsSites(query: string): Promise<SearchResult[]> {
    const newsSites = [
      'site:ntv.com.tr',
      'site:cnnturk.com',
      'site:hurriyet.com.tr',
      'site:sabah.com.tr',
      'site:milliyet.com.tr',
      'site:aa.com.tr'
    ];

    const results: SearchResult[] = [];

    for (const site of newsSites) {
      try {
        const siteResults = await this.searchGoogle(`${query} ${site}`, 3);
        results.push(...siteResults.map(r => ({ ...r, reliability: Math.min(r.reliability + 0.2, 1.0) })));
      } catch (error) {
        console.error(`News site search error for ${site}:`, error);
      }
    }

    return results;
  }

  // Scrape content from URL
  async scrapeContent(url: string): Promise<ScrapedContent | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 15000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $('script, style, nav, header, footer, aside, .advertisement, .ads, .social-share').remove();

      // Extract title
      const title = $('h1').first().text().trim() || 
                   $('title').text().trim() || 
                   $('.entry-title, .article-title, .post-title').first().text().trim();

      // Extract main content
      let content = '';
      const contentSelectors = [
        '.entry-content',
        '.article-content',
        '.post-content',
        '.content',
        'article',
        '.main-content',
        '[role="main"]'
      ];

      for (const selector of contentSelectors) {
        const contentElement = $(selector);
        if (contentElement.length > 0) {
          content = contentElement.text().trim();
          break;
        }
      }

      // Fallback: get all paragraph text
      if (!content) {
        content = $('p').map((_, el) => $(el).text()).get().join(' ').trim();
      }

      // Extract metadata
      const publishDate = this.extractPublishDate($);
      const author = this.extractAuthor($);

      if (!title || !content || content.length < 100) {
        return null;
      }

      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

      return {
        title,
        content: this.cleanContent(content),
        url,
        publishDate,
        author,
        wordCount
      };

    } catch (error) {
      console.error(`Scraping error for ${url}:`, error);
      return null;
    }
  }

  // Content validation and filtering
  validateContent(content: ScrapedContent): boolean {
    // Check minimum content length
    if (content.wordCount < 50) return false;

    // Check for spam indicators
    const text = content.content.toLowerCase();
    const spamWords = ['satın al', 'indirim', 'kampanya', 'reklam', 'promosyon', 'tıkla', 'kazanç'];
    const spamCount = spamWords.filter(word => text.includes(word)).length;
    
    if (spamCount > 3) return false;

    // Check for meaningful content
    const sentences = content.content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length < 3) return false;

    return true;
  }

  // Remove duplicate content
  removeDuplicates(contents: ScrapedContent[]): ScrapedContent[] {
    const seen = new Set<string>();
    const unique: ScrapedContent[] = [];

    for (const content of contents) {
      // Create a hash of first 100 characters
      const hash = content.content.substring(0, 100).toLowerCase().replace(/\s+/g, ' ');
      
      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(content);
      }
    }

    return unique;
  }

  // Helper methods
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  private calculateReliability(domain: string, title: string, snippet: string): number {
    let score = 0.5; // Base score

    // Check if domain is trusted
    if (TRUSTED_SOURCES.some(trusted => domain.includes(trusted))) {
      score += 0.3;
    }

    // Check for quality indicators in title and snippet
    const text = (title + ' ' + snippet).toLowerCase();
    
    const positiveCount = QUALITY_INDICATORS.positive.filter(word => text.includes(word)).length;
    const negativeCount = QUALITY_INDICATORS.negative.filter(word => text.includes(word)).length;
    
    score += (positiveCount * 0.1) - (negativeCount * 0.2);

    // Check for date indicators (recent content)
    if (text.includes('2024') || text.includes('2025') || text.includes('güncel')) {
      score += 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private extractPublishDate($: CheerioAPI): string | undefined {
    const dateSelectors = [
      'time[datetime]',
      '.publish-date',
      '.entry-date',
      '.article-date',
      '[property="article:published_time"]',
      '[name="publish_date"]'
    ];

    for (const selector of dateSelectors) {
      const dateElement = $(selector);
      if (dateElement.length > 0) {
        return dateElement.attr('datetime') || dateElement.attr('content') || dateElement.text().trim();
      }
    }

    return undefined;
  }

  private extractAuthor($: CheerioAPI): string | undefined {
    const authorSelectors = [
      '.author',
      '.entry-author',
      '.article-author',
      '[rel="author"]',
      '[property="article:author"]'
    ];

    for (const selector of authorSelectors) {
      const authorElement = $(selector);
      if (authorElement.length > 0) {
        return authorElement.text().trim();
      }
    }

    return undefined;
  }

  private cleanContent(content: string): string {
    return content
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\sÇçĞğıİÖöŞşÜü.,!?:;()"-]/g, '') // Keep Turkish characters and basic punctuation
      .trim();
  }
}

// Content aggregator that combines all search sources
export class ContentAggregator {
  private scraper = new WebScraper();

  async gatherCurrentInfo(query: string, maxSources: number = 15): Promise<{
    searchResults: SearchResult[];
    scrapedContents: ScrapedContent[];
    summary: string;
  }> {
    console.log(`Gathering current information for: ${query}`);
    
    const allResults: SearchResult[] = [];

    try {
      // Search multiple sources in parallel
      const [googleResults, bingResults, yandexResults, wikiResults, newsResults] = await Promise.allSettled([
        this.scraper.searchGoogle(query, 5),
        this.scraper.searchBing(query, 5),
        this.scraper.searchYandex(query, 3),
        this.scraper.searchWikipedia(query, 2),
        this.scraper.searchNewsSites(query)
      ]);

      // Collect successful results
      if (googleResults.status === 'fulfilled') allResults.push(...googleResults.value);
      if (bingResults.status === 'fulfilled') allResults.push(...bingResults.value);
      if (yandexResults.status === 'fulfilled') allResults.push(...yandexResults.value);
      if (wikiResults.status === 'fulfilled') allResults.push(...wikiResults.value);
      if (newsResults.status === 'fulfilled') allResults.push(...newsResults.value);

      // Sort by reliability and take top results
      const topResults = allResults
        .sort((a, b) => b.reliability - a.reliability)
        .slice(0, maxSources);

      console.log(`Found ${topResults.length} search results, scraping content...`);

      // Scrape content from top URLs
      const scrapingPromises = topResults.map(result => 
        this.scraper.scrapeContent(result.url)
      );

      const scrapedResults = await Promise.allSettled(scrapingPromises);
      const validContents = scrapedResults
        .filter((result): result is PromiseFulfilledResult<ScrapedContent> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
        .filter(content => this.scraper.validateContent(content));

      // Remove duplicates
      const uniqueContents = this.scraper.removeDuplicates(validContents);

      console.log(`Successfully scraped ${uniqueContents.length} unique content pieces`);

      // Create summary
      const summary = this.createSummary(uniqueContents, query);

      return {
        searchResults: topResults,
        scrapedContents: uniqueContents,
        summary
      };

    } catch (error) {
      console.error('Content gathering error:', error);
      return {
        searchResults: [],
        scrapedContents: [],
        summary: `${query} hakkında güncel bilgi toplanamadı.`
      };
    }
  }

  private createSummary(contents: ScrapedContent[], query: string): string {
    if (contents.length === 0) {
      return `${query} hakkında güncel bilgi bulunamadı.`;
    }

    // Create a summary from all content
    const allText = contents.map(c => c.content).join(' ');
    const sentences = allText.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 30 && s.includes(query.split(' ')[0]))
      .slice(0, 5);

    return sentences.length > 0 
      ? sentences.join('. ') + '.'
      : `${query} hakkında ${contents.length} kaynaktan bilgi toplandı.`;
  }
}
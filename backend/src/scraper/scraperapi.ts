import axios from 'axios';
import { config } from '../config';

export class ScraperApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.scraperApiKey;
    this.baseUrl = config.scraperApiUrl;
  }

  async scrape(url: string, renderJs: boolean = true): Promise<string> {
    try {
      console.log(`[ScraperAPI] Scraping: ${url}`);
      
      if (!this.apiKey) {
        console.error('[ScraperAPI] API key is missing!');
        throw new Error('ScraperAPI key not configured');
      }
      
      const scraperUrl = `${this.baseUrl}?api_key=${this.apiKey}&url=${encodeURIComponent(url)}&render=${renderJs ? 'true' : 'false'}&country_code=us`;
      
      console.log(`[ScraperAPI] Request URL: ${scraperUrl.replace(this.apiKey, 'HIDDEN')}`);
      
      const response = await axios.get(scraperUrl, {
        timeout: 60000,
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml',
        },
      });

      console.log(`[ScraperAPI] Success: ${url} (${response.data.length} bytes)`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[ScraperAPI] Error scraping ${url}:`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
      } else {
        console.error(`[ScraperAPI] Error scraping ${url}:`, error);
      }
      throw new Error(`ScraperAPI scraping failed: ${error}`);
    }
  }

  async scrapeMultiple(urls: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    for (const url of urls) {
      try {
        const content = await this.scrape(url);
        results.set(url, content);
        await this.delay(1000);
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        results.set(url, '');
      }
    }
    
    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

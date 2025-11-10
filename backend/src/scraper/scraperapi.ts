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
      
      const response = await axios.get(url, {
        params: {
          api_key: this.apiKey,
          url: url,
          render: renderJs ? 'true' : 'false',
          country_code: 'us',
        },
        timeout: 60000,
      });

      console.log(`[ScraperAPI] Success: ${url}`);
      return response.data;
    } catch (error) {
      console.error(`[ScraperAPI] Error scraping ${url}:`, error);
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

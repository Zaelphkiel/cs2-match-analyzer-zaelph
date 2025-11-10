import axios from 'axios';
import { config } from '../config';

export class BrowserlessScraper {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = config.browserlessUrl;
    this.apiKey = config.browserlessApiKey;
  }

  async scrapeWithBrowserless(url: string, waitForSelector?: string): Promise<string> {
    try {
      console.log(`[Browserless] Scraping: ${url}`);
      
      const response = await axios.post(
        `${this.baseUrl}/content?token=${this.apiKey}`,
        {
          url,
          waitFor: waitForSelector || 'body',
          gotoOptions: {
            waitUntil: 'networkidle2',
            timeout: 30000,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        }
      );

      console.log(`[Browserless] Success: ${url}`);
      return response.data;
    } catch (error) {
      console.error(`[Browserless] Error scraping ${url}:`, error);
      throw new Error(`Browserless scraping failed: ${error}`);
    }
  }

  async scrapeMultiple(urls: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    for (const url of urls) {
      try {
        const content = await this.scrapeWithBrowserless(url);
        results.set(url, content);
      } catch (error) {
        console.error(`Failed to scrape ${url}:`, error);
        results.set(url, '');
      }
    }
    
    return results;
  }
}

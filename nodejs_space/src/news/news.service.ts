import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  link: string;
}

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private cache: { data: NewsItem[]; timestamp: number } | null = null;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  private toAbsoluteUrl(path: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `https://cimag.org.br${clean}`;
  }

  async getNews(): Promise<NewsItem[]> {
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache.data;
    }

    try {
      const news = await this.scrapeNews();
      this.cache = { data: news, timestamp: Date.now() };
      return news;
    } catch (error) {
      this.logger.error('Failed to scrape news', error);
      return this.cache?.data ?? [];
    }
  }

  private async scrapeNews(): Promise<NewsItem[]> {
    const { data } = await axios.get('https://cimag.org.br/mostra-noticias', {
      timeout: 10000,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'CIMAG-App/1.0',
        Accept: 'text/html',
      },
    });
    const html = Buffer.from(data).toString('latin1');

    const $ = cheerio.load(html);
    const newsItems: NewsItem[] = [];

    // Try the news listing page structure
    $('.card, .noticia, [class*="noticia"], [class*="news"]').each((i, el) => {
      const card = $(el);
      const title = card.find('h4, h3, h5, .card-title, [class*="titulo"]').first().text().trim();
      const summary = card.find('p, .card-text, [class*="descricao"]').first().text().trim();
      const imageUrl = card.find('img').first().attr('src') || null;
      const link = card.find('a').first().attr('href') || '';

      if (title) {
        newsItems.push({
          id: String(i + 1),
          date: this.extractDate(card.text()) || '',
          title,
          summary: summary.replace(/Leia Mais\.\.\.$/i, '').trim(),
          imageUrl: this.toAbsoluteUrl(imageUrl),
          link: this.toAbsoluteUrl(link) || 'https://cimag.org.br',
        });
      }
    });

    // Fallback: try scraping the home page if listing didn't work
    if (newsItems.length === 0) {
      return this.scrapeHomePage();
    }

    return newsItems.slice(0, 20);
  }

  private async scrapeHomePage(): Promise<NewsItem[]> {
    const { data } = await axios.get('https://cimag.org.br', {
      timeout: 10000,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'CIMAG-App/1.0',
        Accept: 'text/html',
      },
    });
    const html = Buffer.from(data).toString('latin1');

    const $ = cheerio.load(html);
    const newsItems: NewsItem[] = [];

    // Destaque principal
    const NON_NEWS = ['MUNICÍPIOS ASSOCIADOS', 'DESTAQUES', 'LINKS ÚTEIS', 'DOCUMENTAÇÃO', 'PORTAL', 'CONSÓRCIO', 'CONHEÇA'];
    const isNonNews = (t: string) => NON_NEWS.some(kw => t.toUpperCase().includes(kw)) || t.length < 20;

    const destaqueTitle = $('h2').filter((_, el) => {
      const text = $(el).text().trim();
      return text.length > 20 && !isNonNews(text);
    });

    destaqueTitle.each((i, el) => {
      const title = $(el).text().trim();
      const parent = $(el).parent();
      const summary = parent.find('p').first().text().trim();
      const imageUrl = parent.find('img').first().attr('src') || null;

      if (title) {
        newsItems.push({
          id: `destaque-${i + 1}`,
          date: this.extractDate(parent.text()) || '',
          title,
          summary: summary.substring(0, 300),
          imageUrl: this.toAbsoluteUrl(imageUrl),
          link: 'https://cimag.org.br',
        });
      }
    });

    // h4 news items
    $('h4').each((i, el) => {
      const title = $(el).text().trim();
      if (title.length > 15 && !isNonNews(title)
          && !title.includes('Iluminação') && !title.includes('Portal')
          && !title.includes('LINKS') && !title.includes('DOCUMENTAÇÃO')) {
        const parent = $(el).closest('.card, div');
        const summary = parent.find('p').first().text().trim();
        const imageUrl = parent.find('img').first().attr('src') || null;
        const link = parent.find('a').first().attr('href') || '';

        newsItems.push({
          id: `home-${i + 1}`,
          date: this.extractDate(parent.text()) || '',
          title,
          summary: summary.replace(/Leia Mais\.\.\.$/i, '').trim().substring(0, 300),
          imageUrl: this.toAbsoluteUrl(imageUrl),
          link: this.toAbsoluteUrl(link) || 'https://cimag.org.br',
        });
      }
    });

    return newsItems.slice(0, 20);
  }

  private extractDate(text: string): string | null {
    // Match patterns like "31/03/2026", "16/01/2026"
    const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (match) {
      const [day, month, year] = match[1].split('/');
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
    }
    // Match "Postado em DD/MM/YYYY"
    const match2 = text.match(/Postado em (\d{2}\/\d{2}\/\d{4})/);
    if (match2) {
      const [day, month, year] = match2[1].split('/');
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
    }
    return null;
  }
}

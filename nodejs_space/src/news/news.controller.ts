import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewsService, NewsItem } from './news.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get latest CIMAG news from official website' })
  async getNews(): Promise<NewsItem[]> {
    return this.newsService.getNews();
  }
}

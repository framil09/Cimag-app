import api from './api';

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  link: string;
}

export async function getNews(): Promise<NewsItem[]> {
  const { data } = await api.get<NewsItem[]>('/news');
  return data;
}

import { Injectable, OnInit } from '@angular/core';
import { News } from '../models/news';
import { MOCK_NEWS } from '../data/mock-news';
import { __param } from 'tslib';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  constructor(private http: HttpClient) {}  // ← HttpClient já tem!


  public getAll(): News[] { // Pega todas as notícias
    return [...MOCK_NEWS]; // Ao invés de retornar o MOCK_NEWS bruto retorna uma cópia dele
  }

  public getLatestNews(): News | undefined {
    const allNews = [...MOCK_NEWS]; // Cria uma cópia do Array de todas as notícias

    const sorted = allNews.sort((a, b) => {
      return b.publishAt.getTime() - a.publishAt.getTime();
    });

    /* 
    O método em questão ordena por tempo da seguinte forma:
      o .getTime() é o timestamp em milissegundos desde 01/01/1970
      quanto mais tempo se passa desde a data em questão mais o número aumenta
      portanto a data que tiver o número maior é, logicamente, a mais rescente
    */

    return sorted[0];
  }

  public getSecondaryNews(): News[] {
    const allNews = [...MOCK_NEWS]; // Cria uma cópia do array de todas as notícias

    const sorted = allNews.sort((a, b) => {
      return b.publishAt.getTime() - a.publishAt.getTime(); // Ordena por data
    });

    return sorted.slice(1, 3); // Pegar da posição 1 até 3, sendo a posição 1 inclusa e a posição 3 exclusa, ou seja, quando chegar nela não pega, para (Índices 1 e 2)
  }

  public getCardNews(): News[] {
    const allNews = [...MOCK_NEWS]; // Cria uma cópia do array de todas as notícias

    const sorted = allNews.sort((a, b) => {
      return b.publishAt.getTime() - a.publishAt.getTime();
    });

    return sorted.slice(3, 6);
  }

  public getBySlug(slug: string): News | undefined {
    return MOCK_NEWS.find(news => news.slug === slug);
  }

  public getById(id: number): News | undefined {
    return MOCK_NEWS.find(news => news.id === id);
  }

  public getByType(type: string): News[] {
    const allNews = [...MOCK_NEWS];

    return allNews.filter(news => news.type === type);
  }

  public getTodayNews(): News[] {
    const today = new Date();
    return MOCK_NEWS.filter(news => {
      const pub = new Date(news.publishAt);
      return (
        pub.getDate() === today.getDate() &&
        pub.getMonth() === today.getMonth() &&
        pub.getFullYear() === today.getFullYear()
      );
    });
  }
 
  public getStats() {
    const all = MOCK_NEWS;
    return {
      totalArticles: all.length,
      newToday: this.getTodayNews().length,
    };
  }
 
  private getAllSorted(): News[] {
    return [...MOCK_NEWS].sort(
      (a, b) => b.publishAt.getTime() - a.publishAt.getTime()
    );
  }

  public getRecentNews(limit: number = 5): News[] {
    return this.getAllSorted().slice(0, limit);
  }

  public getCategories(): Observable<any> {  // ← any pro response completo
    return this.http.get<any>('/api/categories');
  }
}

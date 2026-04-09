import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap } from 'rxjs';
import {
  ApiEnvelope,
  ArticleApi,
  ArticleSummaryApi,
  News,
  PagedResponse,
} from '../models/news';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class PublicArticleService {
  private readonly articlesUrl = '/api/articles';

  constructor(private http: HttpClient) {}

  getLatestArticles(limit: number = 6): Observable<News[]> {
    return this.http
      .get<ApiEnvelope<ArticleSummaryApi[]>>(`${this.articlesUrl}/latest?limit=${limit}`)
      .pipe(map((response) => response.data.map((article) => this.mapArticleToNews(article))));
  }

  getArticleBySlug(slug: string): Observable<News> {
    return this.http
      .get<ApiEnvelope<ArticleApi>>(`${this.articlesUrl}/slug/${slug}`)
      .pipe(map((response) => this.mapArticleToNews(response.data)));
  }

  getPublishedArticles(page: number = 0, size: number = 30): Observable<News[]> {
    return this.http
      .get<ApiEnvelope<PagedResponse<ArticleSummaryApi>>>(
        `${this.articlesUrl}?page=${page}&size=${size}`
      )
      .pipe(map((response) => response.data.content.map((article) => this.mapArticleToNews(article))));
  }

  searchArticles(term: string, page: number = 0, size: number = 30): Observable<News[]> {
    const query = encodeURIComponent(term.trim());

    return this.http
      .get<ApiEnvelope<PagedResponse<ArticleSummaryApi>>>(
        `${this.articlesUrl}/search?q=${query}&page=${page}&size=${size}`
      )
      .pipe(map((response) => response.data.content.map((article) => this.mapArticleToNews(article))));
  }

  getArticlesByCategorySlug(slug: string, page: number = 0, size: number = 30): Observable<News[]> {
    return this.http
      .get<ApiEnvelope<Category>>(`/api/categories/slug/${slug}`)
      .pipe(
        switchMap((categoryResponse) =>
          this.http.get<ApiEnvelope<PagedResponse<ArticleSummaryApi>>>(
            `${this.articlesUrl}/category/${categoryResponse.data.id}?page=${page}&size=${size}`
          )
        ),
        map((response) => response.data.content.map((article) => this.mapArticleToNews(article)))
      );
  }

  private mapArticleToNews(article: ArticleSummaryApi | ArticleApi): News {
    const summary = article.summary?.trim() || 'Leia a materia completa.';
    const content = 'content' in article ? article.content : summary;
    const categoryName = article.category?.name || 'Noticias';
    const publishAt = article.publishedAt ? new Date(article.publishedAt) : new Date();

    return {
      id: article.id,
      title: article.title,
      content,
      publishAt,
      updatedAt:
        'updatedAt' in article && article.updatedAt
          ? new Date(article.updatedAt)
          : undefined,
      author: article.author?.name || 'Redacao Soft Chaos',
      imageURL: article.coverImageUrl || this.extractFirstImage(article),
      slug: article.slug,
      type: categoryName,
      description: summary,
      readTime: this.estimateReadTime(content),
      firstImageUrl: article.coverImageUrl,
      tag: categoryName,
    };
  }

  private extractFirstImage(article: ArticleSummaryApi | ArticleApi): string | undefined {
    if ('mediaFiles' in article && article.mediaFiles?.length) {
      const image = article.mediaFiles.find((item) => item.type === 'IMAGE');
      return image?.url;
    }

    return undefined;
  }

  private estimateReadTime(content: string): number {
    const plainText = content.replace(/<[^>]*>/g, ' ').trim();
    const words = plainText ? plainText.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  }
}

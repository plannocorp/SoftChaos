import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, retry, switchMap, throwError } from 'rxjs';
import {
  ApiEnvelope,
  ArticleApi,
  ArticleSummaryApi,
  MediaItem,
  News,
  PagedResponse,
} from '../models/news';
import { Category } from '../models/category';
import { buildApiUrl, buildAssetUrl } from '../config/app-environment';

@Injectable({
  providedIn: 'root',
})
export class PublicArticleService {
  private readonly articlesUrl = buildApiUrl('/api/articles');
  private readonly retryStrategy = {
    count: 2,
    delay: (_error: unknown, retryCount: number) => {
      return new Observable<number>((subscriber) => {
        setTimeout(() => {
          subscriber.next(retryCount);
          subscriber.complete();
        }, 400 * retryCount);
      });
    },
  };

  constructor(private http: HttpClient) {}

  getLatestArticles(limit: number = 6): Observable<News[]> {
    return this.http
      .get<ApiEnvelope<ArticleSummaryApi[]>>(`${this.articlesUrl}/latest?limit=${limit}`)
      .pipe(retry(this.retryStrategy))
      .pipe(
        catchError(() =>
          this.http
            .get<ApiEnvelope<PagedResponse<ArticleSummaryApi>>>(
              `${this.articlesUrl}?page=0&size=${Math.max(limit, 12)}`
            )
            .pipe(
              retry(this.retryStrategy),
              map((response) => response.data.content.slice(0, limit).map((article) => this.mapArticleToNews(article)))
            )
        )
      )
      .pipe(
        map((response) =>
          Array.isArray(response)
            ? response
            : response.data.map((article) => this.mapArticleToNews(article))
        )
      );
  }

  getArticleBySlug(slug: string): Observable<News> {
    return this.http
      .get<ApiEnvelope<ArticleApi>>(`${this.articlesUrl}/slug/${slug}`)
      .pipe(retry(this.retryStrategy))
      .pipe(
        catchError(() =>
          this.http
            .get<ApiEnvelope<PagedResponse<ArticleSummaryApi>>>(
              `${this.articlesUrl}?page=0&size=100`
            )
            .pipe(
              retry(this.retryStrategy),
              map((response) => response.data.content.find((article) => article.slug === slug)),
              switchMap((article) => {
                if (!article) {
                  return throwError(() => new Error('ARTICLE_NOT_FOUND'));
                }

                return this.http
                  .get<ApiEnvelope<ArticleApi>>(`${this.articlesUrl}/${article.id}`)
                  .pipe(retry(this.retryStrategy));
              })
            )
        )
      )
      .pipe(map((response) => this.mapArticleToNews(response.data)));
  }

  getPublishedArticles(page: number = 0, size: number = 30): Observable<News[]> {
    return this.http
      .get<ApiEnvelope<PagedResponse<ArticleSummaryApi>>>(
        `${this.articlesUrl}?page=${page}&size=${size}`
      )
      .pipe(retry(this.retryStrategy))
      .pipe(map((response) => response.data.content.map((article) => this.mapArticleToNews(article))));
  }

  searchArticles(term: string, page: number = 0, size: number = 30): Observable<News[]> {
    const query = encodeURIComponent(term.trim());

    return this.http
      .get<ApiEnvelope<PagedResponse<ArticleSummaryApi>>>(
        `${this.articlesUrl}/search?q=${query}&page=${page}&size=${size}`
      )
      .pipe(retry(this.retryStrategy))
      .pipe(map((response) => response.data.content.map((article) => this.mapArticleToNews(article))));
  }

  getArticlesByCategorySlug(slug: string, page: number = 0, size: number = 30): Observable<News[]> {
    return this.http
      .get<ApiEnvelope<Category>>(buildApiUrl(`/api/categories/slug/${slug}`))
      .pipe(retry(this.retryStrategy))
      .pipe(
        switchMap((categoryResponse) =>
          this.http.get<ApiEnvelope<PagedResponse<ArticleSummaryApi>>>(
            `${this.articlesUrl}/category/${categoryResponse.data.id}?page=${page}&size=${size}`
          ).pipe(retry(this.retryStrategy))
        ),
        map((response) => response.data.content.map((article) => this.mapArticleToNews(article)))
      );
  }

  private mapArticleToNews(article: ArticleSummaryApi | ArticleApi): News {
    const summary = article.summary?.trim() || 'Leia a materia completa.';
    const content = 'content' in article ? article.content : summary;
    const categoryName = article.category?.name || 'Noticias';
    const publishAt = article.publishedAt ? new Date(article.publishedAt) : new Date();
    const mediaItems = this.normalizeMediaItems('mediaFiles' in article ? article.mediaFiles : undefined);

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
      imageURL: buildAssetUrl(article.coverImageUrl || this.extractFirstImage(article)),
      slug: article.slug,
      type: categoryName,
      description: summary,
      readTime: this.estimateReadTime(content),
      firstImageUrl: buildAssetUrl(article.coverImageUrl),
      tag: categoryName,
      mediaItems,
      externalVideoLinks: article.externalVideoLinks?.filter(Boolean),
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

  private normalizeMediaItems(mediaFiles?: MediaItem[]): MediaItem[] | undefined {
    if (!mediaFiles?.length) {
      return undefined;
    }

    return mediaFiles.map((item) => ({
      ...item,
      url: buildAssetUrl(item.url) || item.url,
    }));
  }
}

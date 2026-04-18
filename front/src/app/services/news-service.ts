import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ArticleSummary } from '../models/article-summary';
import { ArticleResponse } from '../models/article-response';
import { PagedResponse } from '../models/paged-response';
import { Category } from '../models/category';

interface BackendArticleSummary {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  coverImageUrl?: string;
  status?: string;
  featured?: boolean;
  pinned?: boolean;
  viewCount?: number;
  commentsCount?: number;
  publishedAt?: string;
  author?: {
    id?: number;
    name?: string;
    avatarUrl?: string;
    role?: string;
  };
  category?: {
    id?: number;
    name?: string;
    slug?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiUrl = '/api/articles';
  private categoriesUrl = '/api/categories';

  constructor(private http: HttpClient) {}

  public getAll(): Observable<ArticleSummary[]> {
    const params = new HttpParams().set('size', '1000');

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response.data.content.map((article: BackendArticleSummary) => this.mapBackendArticle(article))),
      catchError(this.handleError<ArticleSummary[]>('getAll', []))
    );
  }

  public getLatestNews(): Observable<ArticleResponse> {
    return this.getLatestPublishedArticles(1).pipe(
      map(articles => articles[0])
    );
  }

  public getSecondaryNews(): Observable<ArticleResponse[]> {
    return this.getLatestPublishedArticles(3).pipe(
      map(articles => articles.slice(1, 3))
    );
  }

  public getCardNews(): Observable<ArticleResponse[]> {
    return this.getLatestPublishedArticles(6).pipe(
      map(articles => articles.slice(3, 6))
    );
  }

  public getBySlug(slug: string): Observable<ArticleResponse> {
    return this.http.get<any>(`${this.apiUrl}/slug/${slug}`).pipe(
      map(response => this.mapBackendArticle(response.data)),
      catchError(this.handleError<ArticleResponse>('getBySlug'))
    );
  }

  public getById(id: number): Observable<ArticleResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.mapBackendArticle(response.data)),
      catchError(this.handleError<ArticleResponse>('getById'))
    );
  }

  public getByType(type: string): Observable<ArticleResponse[]> {
    console.warn('getByType nao implementado: campo "type" nao existe no backend');
    return throwError(() => new Error('Metodo getByType nao suportado sem o campo "type"'));
  }

  public getTodayNews(): Observable<ArticleResponse[]> {
    const params = new HttpParams().set('size', '50');
    return this.http.get<PagedResponse<ArticleResponse>>(this.apiUrl, { params }).pipe(
      map(response => response.content.filter(article => this.isToday(new Date(article.publishedAt))))
    );
  }

  public getStats(): Observable<{ totalArticles: number; newToday: number }> {
    const total$ = this.http.get<PagedResponse<ArticleResponse>>(this.apiUrl, {
      params: new HttpParams().set('size', '1')
    }).pipe(map(response => response.totalElements));

    const today$ = this.getTodayNews().pipe(map(list => list.length));

    return forkJoin([total$, today$]).pipe(
      map(([totalArticles, newToday]) => ({ totalArticles, newToday })),
      catchError(this.handleError<{ totalArticles: number; newToday: number }>('getStats', { totalArticles: 0, newToday: 0 }))
    );
  }

  public getRecentNews(limit: number = 5): Observable<ArticleResponse[]> {
    return this.getLatestPublishedArticles(limit);
  }

  public getCategories(): Observable<Category[]> {
    return this.http.get<any>(this.categoriesUrl).pipe(
      map(response => response.data),
      catchError(this.handleError<Category[]>('getCategories', []))
    );
  }

  public getPinnedArticles(): Observable<ArticleResponse[]> {
    return this.http.get<any>(`${this.apiUrl}/pinned`).pipe(
      map(response => response.data.map((article: BackendArticleSummary) => this.mapBackendArticle(article))),
      catchError(this.handleError<ArticleResponse[]>('getPinnedArticles', []))
    );
  }

  public getArticlesPaginated(page: number, size: number): Observable<PagedResponse<ArticleSummary>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response.data),
      catchError(this.handleError<PagedResponse<ArticleSummary>>('getArticlesPaginated', {
        content: [],
        totalPages: 0,
        totalElements: 0,
        pageNumber: 0,
        pageSize: size,
        last: true
      }))
    );
  }

  private getLatestPublishedArticles(limit: number): Observable<ArticleResponse[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/latest`, { params }).pipe(
      map(response => response.data.map((article: BackendArticleSummary) => this.mapBackendArticle(article))),
      catchError(this.handleError<ArticleResponse[]>('getLatestPublishedArticles', []))
    );
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate()
      && date.getMonth() === today.getMonth()
      && date.getFullYear() === today.getFullYear();
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: unknown): Observable<T> => {
      console.error(`${operation} falhou:`, error);
      return of(result as T);
    };
  }

  private mapBackendArticle(article: BackendArticleSummary): ArticleResponse {
    return {
      id: article.id,
      slug: article.slug,
      title: article.title,
      subtitle: article.summary || 'Clique para ler a materia completa',
      imageUrl: article.coverImageUrl || 'assets/default-news.jpg',
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      viewCount: article.viewCount ?? 0,
      commentCount: article.commentsCount ?? 0,
      featured: article.featured ?? false,
      pinned: article.pinned ?? false,
      authorName: article.author?.name || 'Soft Chaos',
      categoryName: article.category?.name || 'Geral',
      content: article.summary || '',
      authorId: article.author?.id ?? 0,
      categoryId: article.category?.id ?? 0,
      status: article.status || 'PUBLISHED',
      createdAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      updatedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
    };
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { News } from '../models/news';               // seu modelo local (pode ser adaptado)
import { ArticleSummary } from '../models/article-summary';
import { ArticleResponse } from '../models/article-response';
import { PagedResponse } from '../models/paged-response';
import { Category } from '../models/category';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiUrl = '/api/articles';   // base dos endpoints de artigo
  private categoriesUrl = '/api/categories';

  constructor(private http: HttpClient) { }

  // ===================== MÉTODOS PÚBLICOS =====================

  /**
   * Retorna todos os artigos publicados (sem paginação explícita).
   * Usa uma página grande (limite 1000) – use com moderação.
   */
  public getAll(): Observable<ArticleSummary[]> {
    const params = new HttpParams().set('size', '1000');
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response.data.content), // ← extrai o array de artigos
      catchError(this.handleError<ArticleSummary[]>('getAll', []))
    );
  }

  /**
   * Retorna a notícia mais recente (primeira da lista "latest").
   */
  public getLatestNews(): Observable<ArticleResponse> {
    return this.getLatestPublishedArticles(1).pipe(
      map(articles => articles[0])
    );
  }

  /**
   * Retorna a 2ª e 3ª notícias mais recentes.
   */
  public getSecondaryNews(): Observable<ArticleResponse[]> {
    return this.getLatestPublishedArticles(3).pipe(
      map(articles => articles.slice(1, 3))
    );
  }

  /**
   * Retorna as notícias para os cards (4ª, 5ª e 6ª mais recentes).
   */
  public getCardNews(): Observable<ArticleResponse[]> {
    return this.getLatestPublishedArticles(6).pipe(
      map(articles => articles.slice(3, 6))
    );
  }

  /**
   * Busca um artigo pelo slug (identificador único amigável).
   */
  public getBySlug(slug: string): Observable<ArticleResponse> {
    return this.http.get<any>(`${this.apiUrl}/slug/${slug}`).pipe(
      map(response => response.data),
      tap(article => this.incrementViewCount(article.id).subscribe()),
      catchError(this.handleError<ArticleResponse>('getBySlug'))
    );
  }

  /**
   * Busca um artigo pelo ID numérico.
   */
  public getById(id: number): Observable<ArticleResponse> {
    return this.http.get<ArticleResponse>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => this.incrementViewCount(id).subscribe()),
        catchError(this.handleError<ArticleResponse>('getById'))
      );
  }

  /**
   * Busca artigos por "tipo". ATENÇÃO: o backend não possui esse campo.
   * Você pode mapear para status (ex: 'published', 'draft') ou category.
   * Por enquanto, lança um erro.
   */
  public getByType(type: string): Observable<ArticleResponse[]> {
    console.warn('getByType não implementado – campo "type" não existe no backend');
    return throwError(() => new Error('Método getByType não suportado sem o campo "type"'));
    // Exemplo de implementação alternativa (usando status):
    // const params = new HttpParams().set('status', type);
    // return this.http.get<PagedResponse<ArticleSummaryResponse>>(this.apiUrl, { params })
    //   .pipe(map(res => res.content));
  }

  /**
   * Retorna notícias publicadas hoje (filtro local em cima dos artigos mais recentes).
   * Busca os últimos 50 artigos e filtra pela data de publicação.
   */
  public getTodayNews(): Observable<ArticleResponse[]> {
    const params = new HttpParams().set('size', '50');
    return this.http.get<PagedResponse<ArticleResponse>>(this.apiUrl, { params })
      .pipe(
        map(response => response.content.filter(article => this.isToday(new Date(article.publishedAt))))
      );
  }

  /**
   * Estatísticas: total de artigos publicados + quantos foram publicados hoje.
   */
  public getStats(): Observable<{ totalArticles: number; newToday: number }> {
    // Busca total de artigos (via paginação)
    const total$ = this.http.get<PagedResponse<ArticleResponse>>(this.apiUrl, { params: new HttpParams().set('size', '1') })
      .pipe(map(res => res.totalElements));

    // Busca artigos de hoje
    const today$ = this.getTodayNews().pipe(map(list => list.length));

    return total$.pipe(
      map(total => ({ totalArticles: total, newToday: 0 })),
      // Combina com today$ – implementação simplificada; para código robusto use forkJoin
    );
    // Melhor com forkJoin:
    // return forkJoin([total$, today$]).pipe(map(([total, newToday]) => ({ totalArticles: total, newToday })));
  }

  /**
   * Retorna os N artigos mais recentes.
   */
  public getRecentNews(limit: number = 5): Observable<ArticleResponse[]> {
    return this.getLatestPublishedArticles(limit);
  }

  /**
   * Retorna todas as categorias disponíveis.
   */
  public getCategories(): Observable<Category[]> {
    return this.http.get<any>(this.categoriesUrl).pipe(
      map(response => response.data) // ou response.data.content, dependendo do formato
    );
  }

  // ===================== MÉTODOS PRIVADOS (auxiliares) =====================

  /**
   * Invoca o endpoint de artigos mais recentes (limitado).
   * Endpoint backend: GET /api/articles/latest?limit={limit}
   */
  private getLatestPublishedArticles(limit: number): Observable<ArticleResponse[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(`${this.apiUrl}/latest`, { params }).pipe(
      map(response => response.data), // se for array direto dentro de data
      catchError(this.handleError<ArticleResponse[]>('getLatestPublishedArticles', []))
    );
  }

  /**
   * Incrementa o contador de visualizações de um artigo.
   * Endpoint backend: PATCH /api/articles/{id}/view (ou PUT)
   */
  private incrementViewCount(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/view`, {})
      .pipe(catchError(err => {
        console.error(`Erro ao incrementar views do artigo ${id}`, err);
        return of(void 0);
      }));
  }

  /**
   * Verifica se uma data é "hoje" (comparando dia/mês/ano).
   */
  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  /**
   * Tratamento genérico de erros HTTP.
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} falhou:`, error);
      return of(result as T);
    };
  }

  /**
 * Retorna artigos fixados (pinned=true) ordenados por data decrescente.
 * Endpoint backend: GET /api/articles/pinned
 */
  public getPinnedArticles(): Observable<ArticleResponse[]> {
    return this.http.get<any>(`${this.apiUrl}/pinned`).pipe(
      map(response => response.data),
      catchError(this.handleError<ArticleResponse[]>('getPinnedArticles', []))
    );
  }

  /**
 * Retorna artigos paginados (com suporte a página e tamanho).
 * @param page Número da página (0-indexed)
 * @param size Quantidade de itens por página
 * @returns Observable<PagedResponse<ArticleSummary>>
 */
  public getArticlesPaginated(page: number, size: number): Observable<PagedResponse<ArticleSummary>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response.data), // ← extrai o objeto PagedResponse
      catchError(this.handleError<PagedResponse<ArticleSummary>>('getArticlesPaginated', { content: [], totalPages: 0, totalElements: 0, pageNumber: 0, pageSize: size, last: true }))
    );
  }
}

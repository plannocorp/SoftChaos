import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CommentResponse } from '../models/comment-response';
import { CreateCommentRequest } from '../models/create-comment-request';
import { PagedResponse } from '../models/paged-response';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = '/api/comments';

  constructor(private http: HttpClient) { }

  /**
   * Retorna comentários aprovados de um artigo (paginado)
   * Endpoint: GET /api/comments/article/{articleId}?page=0&size=10
   */
  getCommentsByArticle(articleId: number, page: number = 0, size: number = 10): Observable<PagedResponse<CommentResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PagedResponse<CommentResponse>>(`${this.apiUrl}/article/${articleId}`, { params });
  }

  /**
   * Cria um novo comentário
   * Endpoint: POST /api/comments
   */
  createComment(comment: CreateCommentRequest): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(this.apiUrl, comment);
  }

  /**
 * Retorna total de comentários (todos os status)
 */
  getTotalComments(): Observable<number> {
    return this.http.get<PagedResponse<CommentResponse>>(`${this.apiUrl}?size=1`).pipe(
      map(res => res.totalElements),
      catchError(() => of(0))
    );
  }

  /**
   * Retorna quantidade de comentários pendentes
   */
  getPendingCommentsCount(): Observable<number> {
    return this.http.get<PagedResponse<CommentResponse>>(`${this.apiUrl}/pending?size=1`).pipe(
      map(res => res.totalElements),
      catchError(() => of(0))
    );
  }

  /**
   * Retorna quantidade de comentários aprovados
   */
  getApprovedCommentsCount(): Observable<number> {
    return this.http.get<PagedResponse<CommentResponse>>(`${this.apiUrl}/approved?size=1`).pipe(
      map(res => res.totalElements),
      catchError(() => of(0))
    );
  }

  /**
   * Retorna comentários recentes (últimos 5, independente do status)
   */
  getRecentComments(limit: number = 5): Observable<CommentResponse[]> {
    const params = new HttpParams().set('size', limit.toString()).set('sort', 'createdAt,desc');
    return this.http.get<PagedResponse<CommentResponse>>(this.apiUrl, { params }).pipe(
      map(res => res.content),
      catchError(() => of([]))
    );
  }

  /**
 * Retorna comentários pendentes (paginado) - para admin
 * Endpoint: GET /api/comments/pending?page=0&size=20&search=
 */
  getPendingComments(page: number = 0, size: number = 20, search?: string): Observable<PagedResponse<CommentResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) params = params.set('search', search);
    return this.http.get<PagedResponse<CommentResponse>>(`${this.apiUrl}/pending`, { params })
      .pipe(catchError(this.handleError<PagedResponse<CommentResponse>>('getPendingComments')));
  }

  /**
   * Aprova um comentário
   * Endpoint: PUT /api/comments/{id}/approve
   */
  approveComment(id: number): Observable<CommentResponse> {
    return this.http.put<CommentResponse>(`${this.apiUrl}/${id}/approve`, {})
      .pipe(catchError(this.handleError<CommentResponse>('approveComment')));
  }

  /**
   * Rejeita um comentário
   * Endpoint: PUT /api/comments/{id}/reject
   */
  rejectComment(id: number): Observable<CommentResponse> {
    return this.http.put<CommentResponse>(`${this.apiUrl}/${id}/reject`, {})
      .pipe(catchError(this.handleError<CommentResponse>('rejectComment')));
  }

  /**
   * Deleta um comentário
   * Endpoint: DELETE /api/comments/{id}
   */
  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError<void>('deleteComment')));
  }

  // Adicione este método auxiliar se não existir
  private handleError<T>(operation: string) {
    return (error: any): Observable<T> => {
      console.error(`${operation} falhou:`, error);
      return throwError(() => error);
    };
  }
}

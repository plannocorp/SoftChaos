import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  BackendCommentResponse,
  Comment,
  CreateCommentRequest,
  CommentFilterStatus,
  PagedResponse
} from '../models/comment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = '/api/comments';

  constructor(private http: HttpClient) {}

  getAdminComments(status: CommentFilterStatus = 'ALL', page = 0, size = 100): Observable<Comment[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status !== 'ALL') {
      params = params.set('status', status);
    }

    return this.http.get<{ data: PagedResponse<BackendCommentResponse> }>(`${this.apiUrl}/admin`, { params }).pipe(
      map((response) => response.data.content.map((comment) => this.mapToFrontend(comment)))
    );
  }

  getPendingComments(page = 0, size = 50, searchTerm?: string): Observable<Comment[]> {
    return this.http.get<{ data: PagedResponse<BackendCommentResponse> }>(`${this.apiUrl}/pending`, {
      params: new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
    }).pipe(
      map((response) => response.data.content.map((comment) => this.mapToFrontend(comment))),
      map((comments) => {
        const normalizedSearch = searchTerm?.trim().toLowerCase();

        if (!normalizedSearch) {
          return comments;
        }

        return comments.filter((comment) =>
          comment.author.toLowerCase().includes(normalizedSearch)
          || comment.email.toLowerCase().includes(normalizedSearch)
          || comment.content.toLowerCase().includes(normalizedSearch)
          || comment.articleTitle.toLowerCase().includes(normalizedSearch)
        );
      })
    );
  }

  getApprovedCommentsByArticle(articleId: number, page = 0, size = 20): Observable<Comment[]> {
    return this.http.get<{ data: PagedResponse<BackendCommentResponse> }>(`${this.apiUrl}/article/${articleId}`, {
      params: new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString())
    }).pipe(
      map((response) => response.data.content.map((comment) => this.mapToFrontend(comment)))
    );
  }

  createComment(articleId: number, payload: CreateCommentRequest): Observable<Comment> {
    return this.http.post<{ data: BackendCommentResponse }>(`${this.apiUrl}/article/${articleId}`, payload).pipe(
      map((response) => this.mapToFrontend(response.data))
    );
  }

  approveComment(id: number): Observable<Comment> {
    return this.http.put<{ data: BackendCommentResponse }>(`${this.apiUrl}/${id}/approve`, {}).pipe(
      map((response) => this.mapToFrontend(response.data))
    );
  }

  rejectComment(id: number): Observable<Comment> {
    return this.http.put<{ data: BackendCommentResponse }>(`${this.apiUrl}/${id}/reject`, {}).pipe(
      map((response) => this.mapToFrontend(response.data))
    );
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapToFrontend(backend: BackendCommentResponse): Comment {
    const statusMap: Record<BackendCommentResponse['status'], Comment['status']> = {
      PENDING: 'PENDENTE',
      APPROVED: 'APROVADO',
      REJECTED: 'REJEITADO',
      DELETED: 'APAGADO'
    };

    return {
      id: backend.id,
      articleTitle: backend.articleTitle || 'Artigo nao encontrado',
      articleSlug: backend.articleSlug || '',
      articleCoverImageUrl: backend.articleCoverImageUrl || undefined,
      author: backend.authorName,
      email: backend.authorEmail || 'N/D',
      content: backend.content,
      createdAt: new Date(backend.createdAt),
      status: statusMap[backend.status] || 'PENDENTE',
      rawStatus: backend.status
    };
  }
}


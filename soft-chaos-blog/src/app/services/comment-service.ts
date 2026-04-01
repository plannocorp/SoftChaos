import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendCommentResponse, Comment, PagedResponse } from '../models/comment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = '/api/comments';

  constructor(private http: HttpClient) { }

  getPendingComments(page: number = 0, size: number = 20, search?: string): Observable<Comment[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) params = params.set('search', search);

    return this.http.get<{ data: PagedResponse<BackendCommentResponse> }>(`${this.apiUrl}/pending`, { params }).pipe(
      map(response => {
        const backendComments = response.data.content;
        return backendComments.map(comment => this.mapToFrontend(comment));
      })
    );
  }

  approveComment(id: number): Observable<Comment> {
    return this.http.put<{ data: BackendCommentResponse }>(`${this.apiUrl}/${id}/approve`, {}).pipe(
      map(response => this.mapToFrontend(response.data))
    );
  }

  rejectComment(id: number): Observable<Comment> {
    return this.http.put<{ data: BackendCommentResponse }>(`${this.apiUrl}/${id}/reject`, {}).pipe(
      map(response => this.mapToFrontend(response.data))
    );
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // FUNÇÃO mapToFrontend CORRIGIDA (move mapStatus pra dentro)
  private mapToFrontend(backend: BackendCommentResponse): Comment {
    const mapStatus = (status: string): 'PENDENTE' | 'APROVADO' | 'REJEITADO' => {
      const statusMap: Record<string, 'PENDENTE' | 'APROVADO' | 'REJEITADO'> = {
        'PENDING': 'PENDENTE',
        'APPROVED': 'APROVADO',
        'REJECTED': 'REJEITADO'
      };
      return statusMap[status] || 'PENDENTE';
    };

    return {
      id: backend.id,
      articleTitle: backend.articleTitle || 'Artigo não encontrado',  // ← DIRETO!
      articleSlug: '',  // ← Backend não manda, deixa vazio
      author: backend.authorName,
      email: 'N/D',  // ← Backend não manda mais email
      content: backend.content,
      createdAt: new Date(backend.createdAt),
      status: mapStatus(backend.status)
    };
  }
}
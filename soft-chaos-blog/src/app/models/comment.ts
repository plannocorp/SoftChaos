export interface BackendCommentResponse {
  id: number;
  authorName: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  articleTitle: string;  // ← NOVO: direto!
  // authorEmail?: string;  // ← REMOVIDO (não vem mais)
}

export interface Comment {
  id: number;
  articleTitle: string;
  articleSlug: string;  // ← Mantenha (pode ser '')
  author: string;
  email: string;        // ← Mantenha (pode ser vazio)
  content: string;
  createdAt: Date;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CreateCommentRequest {
  authorName: string;
  authorEmail: string;
  content: string;
}

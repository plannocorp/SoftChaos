export type BackendCommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED';
export type CommentStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'APAGADO';
export type CommentFilterStatus = 'ALL' | BackendCommentStatus;

export interface BackendCommentResponse {
  id: number;
  authorName: string;
  authorEmail: string;
  content: string;
  status: BackendCommentStatus;
  createdAt: string;
  articleTitle: string;
  articleSlug?: string;
  articleCoverImageUrl?: string;
}

export interface Comment {
  id: number;
  articleTitle: string;
  articleSlug: string;
  articleCoverImageUrl?: string;
  author: string;
  email: string;
  content: string;
  createdAt: Date;
  status: CommentStatus;
  rawStatus: BackendCommentStatus;
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


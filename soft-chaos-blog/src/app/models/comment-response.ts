export interface CommentResponse {
  id: number;
  authorName: string;
  authorEmail?: string;
  content: string;
  createdAt: Date;
  status: string;
  articleTitle?: string;
}

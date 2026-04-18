export interface CreateCommentRequest {
  articleId: number;
  authorName: string;
  authorEmail: string;
  content: string;
}

import { ArticleSummary } from "./article-summary";

export interface ArticleResponse extends ArticleSummary {
  content: string;
  authorId: number;
  categoryId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

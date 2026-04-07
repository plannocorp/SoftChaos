export interface ArticleSummary {
  id: number;
  slug: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  publishedAt: Date;      // string ISO do backend
  viewCount: number;
  commentCount: number;
  featured: boolean;
  pinned: boolean;
  authorName: string;
  categoryName: string;
}

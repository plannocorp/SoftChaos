export interface DashboardStatsResponse {
  totalArticles: number;
  totalUsers: number;
  totalComments: number;
  totalCategories: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingComments: number;
  approvedComments: number;
  topArticles: TopArticle[];
  recentArticles: RecentArticle[];
  recentComments: RecentComment[];
}

export interface TopArticle {
  id: number;
  title: string;
  slug: string;
  views: number;
  authorName: string;
}

export interface RecentArticle {
  id: number;
  title: string;
  slug: string;
  status: string;
  authorName: string;
  createdAt: string;
}

export interface RecentComment {
  id: number;
  content: string;
  authorName: string;
  articleTitle: string;
  status: string;
  createdAt: string;
}
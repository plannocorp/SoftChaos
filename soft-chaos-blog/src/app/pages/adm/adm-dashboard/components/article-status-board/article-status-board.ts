import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiEnvelope, ArticleApi, ArticleSummaryApi, PagedResponse } from '../../../../../models/news';

type ArticleStatusFilter = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';

interface RouteBoardData {
  status: ArticleStatusFilter;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-article-status-board',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './article-status-board.html',
  styleUrl: './article-status-board.css',
})
export class ArticleStatusBoard implements OnInit {
  private readonly backendBaseUrl = 'http://localhost:8080';

  status: ArticleStatusFilter = 'DRAFT';
  title = 'Rascunhos';
  subtitle = '';
  loading = true;
  error = '';
  actionMessage = '';
  publishingId: number | null = null;
  deletingId: number | null = null;
  archivingId: number | null = null;
  previewLoading = false;
  previewArticle?: ArticleApi;
  articles: ArticleSummaryApi[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const routeData = this.route.snapshot.data as Partial<RouteBoardData>;
    this.status = routeData.status ?? 'DRAFT';
    this.title = routeData.title ?? 'Rascunhos';
    this.subtitle = routeData.subtitle ?? '';
    this.loadArticles();
  }

  loadArticles(): void {
    this.loading = true;
    this.error = '';

    this.http.get<ApiEnvelope<PagedResponse<ArticleSummaryApi>>>(
      `/api/articles/admin?status=${this.status}&page=0&size=30`
    ).subscribe({
      next: (response) => {
        this.articles = response.data.content;
        this.loading = false;
      },
      error: () => {
        this.error = 'Nao foi possivel carregar esta lista agora.';
        this.loading = false;
      }
    });
  }

  publishNow(articleId: number): void {
    if (this.publishingId === articleId) {
      return;
    }

    this.publishingId = articleId;
    this.actionMessage = '';

    this.http.post<ApiEnvelope<unknown>>(`/api/articles/${articleId}/publish`, {}).subscribe({
      next: () => {
        this.actionMessage = 'Artigo publicado com sucesso.';
        this.publishingId = null;
        this.loadArticles();
      },
      error: () => {
        this.actionMessage = 'Nao foi possivel publicar o artigo agora.';
        this.publishingId = null;
      }
    });
  }

  archiveArticle(articleId: number): void {
    this.archivingId = articleId;
    this.actionMessage = '';

    this.http.post<ApiEnvelope<unknown>>(`/api/articles/${articleId}/archive`, {}).subscribe({
      next: () => {
        this.actionMessage = 'Artigo arquivado com sucesso.';
        this.archivingId = null;
        this.loadArticles();
      },
      error: () => {
        this.actionMessage = 'Nao foi possivel arquivar o artigo agora.';
        this.archivingId = null;
      }
    });
  }

  openPreview(articleId: number): void {
    this.previewLoading = true;
    this.previewArticle = undefined;
    this.actionMessage = '';

    this.http.get<ApiEnvelope<ArticleApi>>(`/api/articles/${articleId}`).subscribe({
      next: (response) => {
        this.previewArticle = response.data;
        this.previewLoading = false;
      },
      error: () => {
        this.actionMessage = 'Nao foi possivel carregar a visualizacao do artigo.';
        this.previewLoading = false;
      }
    });
  }

  closePreview(): void {
    this.previewArticle = undefined;
    this.previewLoading = false;
  }

  deleteArticle(articleId: number): void {
    if (!window.confirm('Deseja excluir este artigo permanentemente?')) {
      return;
    }

    this.deletingId = articleId;
    this.actionMessage = '';

    this.http.delete<ApiEnvelope<unknown>>(`/api/articles/${articleId}`).subscribe({
      next: () => {
        this.articles = this.articles.filter((article) => article.id !== articleId);
        this.previewArticle = this.previewArticle?.id === articleId ? undefined : this.previewArticle;
        this.actionMessage = 'Artigo excluido com sucesso.';
        this.deletingId = null;
      },
      error: () => {
        this.actionMessage = 'Nao foi possivel excluir o artigo agora.';
        this.deletingId = null;
      }
    });
  }

  getStatusLabel(article: ArticleSummaryApi | ArticleApi): string {
    if (article.status === 'SCHEDULED') {
      return 'Agendado';
    }

    if (article.status === 'PUBLISHED') {
      return 'Publicado';
    }

    if (article.status === 'ARCHIVED') {
      return 'Arquivado';
    }

    return 'Rascunho';
  }

  getArticleCover(article: ArticleSummaryApi | ArticleApi | undefined): string | null {
    const coverImageUrl = article?.coverImageUrl;

    if (!coverImageUrl) {
      return null;
    }

    if (coverImageUrl.startsWith('http://') || coverImageUrl.startsWith('https://')) {
      return coverImageUrl;
    }

    return `${this.backendBaseUrl}${coverImageUrl.startsWith('/') ? coverImageUrl : `/${coverImageUrl}`}`;
  }
}


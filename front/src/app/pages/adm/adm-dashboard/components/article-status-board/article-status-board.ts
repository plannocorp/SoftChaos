import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiEnvelope, ArticleApi, ArticleSummaryApi, PagedResponse } from '../../../../../models/news';
import { buildAssetUrl } from '../../../../../config/app-environment';
import { Category } from '../../../../../models/category';

type ArticleStatusFilter = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';

interface RouteBoardData {
  status: ArticleStatusFilter;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-article-status-board',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './article-status-board.html',
  styleUrl: './article-status-board.css',
})
export class ArticleStatusBoard implements OnInit {
  status: ArticleStatusFilter = 'DRAFT';
  title = 'Rascunhos';
  subtitle = '';
  loading = true;
  error = '';
  actionMessage = '';
  publishingId: number | null = null;
  deletingId: number | null = null;
  archivingId: number | null = null;
  pendingDeleteArticle?: ArticleSummaryApi;
  expandedArticleId: number | null = null;
  selectedArticle?: ArticleSummaryApi;
  selectedArticleDetails?: ArticleApi;
  selectedImageIndex = 0;
  modalLoading = false;
  articles: ArticleSummaryApi[] = [];
  categories: Category[] = [];
  currentPage = 0;
  pageSize = 9;
  totalPages = 0;
  totalElements = 0;
  selectedCategoryId = '';
  startDate = '';
  endDate = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const routeData = this.route.snapshot.data as Partial<RouteBoardData>;
    this.status = routeData.status ?? 'DRAFT';
    this.title = routeData.title ?? 'Rascunhos';
    this.subtitle = routeData.subtitle ?? '';
    this.loadCategories();
    this.loadArticles();
  }

  loadArticles(): void {
    this.loading = true;
    this.error = '';
    let params = new HttpParams()
      .set('status', this.status)
      .set('page', this.currentPage.toString())
      .set('size', this.pageSize.toString());

    if (this.status === 'PUBLISHED') {
      if (this.selectedCategoryId) {
        params = params.set('categoryId', this.selectedCategoryId);
      }

      if (this.startDate) {
        params = params.set('startDate', this.startDate);
      }

      if (this.endDate) {
        params = params.set('endDate', this.endDate);
      }
    }

    this.http.get<ApiEnvelope<PagedResponse<ArticleSummaryApi>>>(
      '/api/articles/admin',
      { params }
    ).subscribe({
      next: (response) => {
        const pageData = response.data;
        this.articles = pageData.content;
        this.currentPage = pageData.pageNumber;
        this.pageSize = pageData.pageSize;
        this.totalPages = pageData.totalPages;
        this.totalElements = pageData.totalElements;
        this.loading = false;
      },
      error: () => {
        this.error = 'Nao foi possivel carregar esta lista agora.';
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.http.get<ApiEnvelope<Category[]>>('/api/categories').subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  applyPublishedFilters(): void {
    this.currentPage = 0;
    this.loadArticles();
  }

  clearPublishedFilters(): void {
    this.selectedCategoryId = '';
    this.startDate = '';
    this.endDate = '';
    this.applyPublishedFilters();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadArticles();
  }

  toggleArticleDetails(articleId: number): void {
    this.expandedArticleId = this.expandedArticleId === articleId ? null : articleId;
  }

  openArticleDetails(article: ArticleSummaryApi): void {
    this.selectedArticle = article;
    this.selectedArticleDetails = undefined;
    this.selectedImageIndex = 0;
    this.modalLoading = true;

    this.http.get<ApiEnvelope<ArticleApi>>(`/api/articles/${article.id}`).subscribe({
      next: (response) => {
        this.selectedArticleDetails = response.data;
        this.modalLoading = false;
      },
      error: () => {
        this.selectedArticleDetails = undefined;
        this.modalLoading = false;
      }
    });
  }

  closeArticleDetails(): void {
    this.selectedArticle = undefined;
    this.selectedArticleDetails = undefined;
    this.selectedImageIndex = 0;
    this.modalLoading = false;
  }

  goToModalImage(direction: number): void {
    const images = this.getSelectedArticleImages();

    if (images.length <= 1) {
      return;
    }

    this.selectedImageIndex = (this.selectedImageIndex + direction + images.length) % images.length;
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

  requestDeleteArticle(article: ArticleSummaryApi): void {
    this.pendingDeleteArticle = article;
    this.actionMessage = '';
  }

  cancelDeleteArticle(): void {
    this.pendingDeleteArticle = undefined;
  }

  confirmDeleteArticle(): void {
    const article = this.pendingDeleteArticle;

    if (!article) {
      return;
    }

    const articleId = article.id;
    this.deletingId = articleId;
    this.actionMessage = '';

    this.http.delete<ApiEnvelope<unknown>>(`/api/articles/${articleId}`).subscribe({
      next: () => {
        this.articles = this.articles.filter((article) => article.id !== articleId);
        this.selectedArticle = this.selectedArticle?.id === articleId ? undefined : this.selectedArticle;
        this.pendingDeleteArticle = undefined;
        this.actionMessage = 'Artigo excluido com sucesso.';
        this.deletingId = null;
      },
      error: () => {
        this.actionMessage = 'Nao foi possivel excluir o artigo agora.';
        this.deletingId = null;
      }
    });
  }

  getStatusLabel(article: ArticleSummaryApi): string {
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

  getArticleCover(article: ArticleSummaryApi | undefined): string | null {
    return buildAssetUrl(article?.coverImageUrl) ?? null;
  }

  getSelectedArticleImages(): string[] {
    const urls = [
      this.selectedArticleDetails?.coverImageUrl || this.selectedArticle?.coverImageUrl,
      ...(this.selectedArticleDetails?.mediaFiles ?? [])
        .filter((media) => media.type === 'IMAGE')
        .map((media) => media.url)
    ]
      .map((url) => buildAssetUrl(url) ?? null)
      .filter((url): url is string => Boolean(url));

    return Array.from(new Set(urls));
  }

  getPageLabel(): string {
    if (!this.totalElements) {
      return '0 artigos';
    }

    return `Pagina ${this.currentPage + 1} de ${this.totalPages}`;
  }

  private canUseHoverPreview(): boolean {
    return typeof window !== 'undefined'
      && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }
}


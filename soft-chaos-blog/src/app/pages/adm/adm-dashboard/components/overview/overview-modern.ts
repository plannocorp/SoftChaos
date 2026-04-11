import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DashboardStatsResponse } from '../../../../../models/dashboard';

@Component({
  selector: 'app-overview-modern',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './overview-modern.html',
  styleUrl: './overview-modern.css',
})
export class OverviewModern implements OnInit {
  stats?: DashboardStatsResponse;
  loading = true;
  error = '';
  activeTab: 'articles' | 'comments' = 'articles';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.error = '';

    this.http.get<{ data: DashboardStatsResponse }>('/api/dashboard/stats').subscribe({
      next: (response) => {
        this.stats = response.data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Nao foi possivel carregar os dados do dashboard.';
        this.loading = false;
      }
    });
  }

  setTab(tab: 'articles' | 'comments'): void {
    this.activeTab = tab;
  }

  getPublicationRate(): number {
    if (!this.stats?.totalArticles) {
      return 0;
    }

    return Math.round((this.stats.publishedArticles / this.stats.totalArticles) * 100);
  }

  getDraftRate(): number {
    if (!this.stats?.totalArticles) {
      return 0;
    }

    return Math.round((this.stats.draftArticles / this.stats.totalArticles) * 100);
  }

  getScheduledRate(): number {
    if (!this.stats?.totalArticles) {
      return 0;
    }

    return Math.round((this.stats.scheduledArticles / this.stats.totalArticles) * 100);
  }

  getModerationRate(): number {
    if (!this.stats?.totalComments) {
      return 0;
    }

    return Math.round((this.stats.approvedComments / this.stats.totalComments) * 100);
  }

  getTotalTopViews(): number {
    return this.stats?.topArticles.reduce((total, article) => total + article.views, 0) ?? 0;
  }

  getPendingCommentsLabel(): string {
    const total = this.stats?.pendingComments ?? 0;
    return total === 1 ? '1 comentario pendente' : `${total} comentarios pendentes`;
  }

  getStatusLabel(status: string): string {
    const normalizedStatus = status?.toUpperCase();

    if (normalizedStatus === 'PUBLISHED') {
      return 'Publicado';
    }

    if (normalizedStatus === 'SCHEDULED') {
      return 'Agendado';
    }

    if (normalizedStatus === 'ARCHIVED') {
      return 'Arquivado';
    }

    if (normalizedStatus === 'APPROVED') {
      return 'Aprovado';
    }

    if (normalizedStatus === 'PENDING') {
      return 'Pendente';
    }

    return 'Rascunho';
  }
}

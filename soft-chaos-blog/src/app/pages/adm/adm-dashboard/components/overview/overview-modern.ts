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
}

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class Overview implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  stats!: any;
  recentArticles: any[] = [];
  recentComments: any[] = [];
  loading = true;  // ← COMEÇA TRUE!
  activeTab = 'articles';

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    console.log('🚀 Overview ngOnInit!');  // ← DEBUG
    this.loadDashboardStats();
  }

  loadDashboardStats() {
    console.log('🔄 Loading...');
    this.loading = true;

    this.http.get('/api/dashboard/stats').subscribe({
      next: (response: any) => {
        console.log('✅ Response completa:', response);
        this.stats = response.data;
        console.log('🔓 Loading = false!');
        this.loading = false;  // ← FORÇA AQUI!

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('❌', err);
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
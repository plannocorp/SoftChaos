import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';  // ← map adicionado
import { NewsService } from '../../../../../services/news-service';
import { CommentService } from '../../../../../services/comment-service';
import { ArticleResponse } from '../../../../../models/article-response';
import { CommentResponse } from '../../../../../models/comment-response';
import { PagedResponse } from '../../../../../models/paged-response';
import { ArticleSummary } from '../../../../../models/article-summary';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class Overview implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  stats = {
    totalArticles: 0,
    totalComments: 0,
    pendingComments: 0,
    approvedComments: 0
  };
  recentArticles: ArticleResponse[] = [];
  recentComments: CommentResponse[] = [];
  loading = true;
  activeTab = 'articles';

  constructor(
    private newsService: NewsService,
    private commentService: CommentService
  ) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.loading = true;

    const recentArticles$ = this.newsService.getRecentNews(5).pipe(catchError(() => of([])));
    const recentComments$ = this.commentService.getRecentComments(5).pipe(catchError(() => of([])));
    const totalArticles$ = this.newsService.getArticlesPaginated(0, 1).pipe(
      map((res: PagedResponse<ArticleSummary>) => res.totalElements),
      catchError(() => of(0))
    );
    const totalComments$ = this.commentService.getTotalComments().pipe(catchError(() => of(0)));
    const pendingComments$ = this.commentService.getPendingCommentsCount().pipe(catchError(() => of(0)));
    const approvedComments$ = this.commentService.getApprovedCommentsCount().pipe(catchError(() => of(0)));

    forkJoin({
      recentArticles: recentArticles$,
      recentComments: recentComments$,
      totalArticles: totalArticles$,
      totalComments: totalComments$,
      pendingComments: pendingComments$,
      approvedComments: approvedComments$
    }).subscribe({
      next: (result) => {
        this.stats.totalArticles = result.totalArticles;
        this.stats.totalComments = result.totalComments;
        this.stats.pendingComments = result.pendingComments;
        this.stats.approvedComments = result.approvedComments;
        this.recentArticles = result.recentArticles;
        this.recentComments = result.recentComments;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard', err);
        this.loading = false;
      }
    });
  }

  editArticle(id: number) {
    console.log('Editar artigo', id);
    // Futuramente: navegar para página de edição
    // this.router.navigate(['/adm/artigos/editar', id]);
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

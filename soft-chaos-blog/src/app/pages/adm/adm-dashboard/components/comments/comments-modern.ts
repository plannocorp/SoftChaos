import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Comment, CommentFilterStatus } from '../../../../../models/comment';
import { CommentService } from '../../../../../services/comment-service';
import { buildAssetUrl } from '../../../../../config/app-environment';

interface CommentFilterChip {
  label: string;
  status: CommentFilterStatus;
}

@Component({
  selector: 'app-comments-modern',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, DatePipe],
  templateUrl: './comments-modern.html',
  styleUrl: './comments-modern.css',
})
export class CommentsModern implements OnInit {
  readonly filters: CommentFilterChip[] = [
    { label: 'Todos', status: 'ALL' },
    { label: 'Pendentes', status: 'PENDING' },
    { label: 'Aprovados', status: 'APPROVED' },
    { label: 'Rejeitados', status: 'REJECTED' },
    { label: 'Apagados', status: 'DELETED' },
  ];

  comments: Comment[] = [];
  filteredComments: Comment[] = [];
  selectedComment?: Comment;
  expandedCommentId: number | null = null;
  activeStatus: CommentFilterStatus = 'ALL';
  searchTerm = '';
  articleFilter = '';
  dateFrom = '';
  dateTo = '';
  error = '';
  actionMessage = '';
  loading = false;
  actionLoadingId: number | null = null;
  pendingDeleteComment?: Comment;
  currentPage = 0;
  pageSize = 8;
  totalPages = 0;
  totalElements = 0;
  filterCounts: Record<CommentFilterStatus, number> = {
    ALL: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    DELETED: 0,
  };

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadComments();
    this.loadFilterCounts();
  }

  loadComments(): void {
    this.loading = true;
    this.error = '';

    this.commentService.getAdminCommentsPage(
      this.activeStatus,
      this.currentPage,
      this.pageSize,
      this.articleFilter,
      this.dateFrom,
      this.dateTo
    ).subscribe({
      next: (response) => {
        this.comments = response.content;
        this.currentPage = response.pageNumber;
        this.pageSize = response.pageSize;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Erro ao carregar comentarios: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  setStatusFilter(status: CommentFilterStatus): void {
    this.activeStatus = status;
    this.currentPage = 0;
    this.loadComments();
  }

  filterComments(): void {
    this.applyFilters();
  }

  applyDashboardFilters(): void {
    this.currentPage = 0;
    this.loadFilterCounts();
    this.loadComments();
  }

  clearDashboardFilters(): void {
    this.articleFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadFilterCounts();
    this.loadComments();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.currentPage = page;
    this.loadComments();
  }

  viewComment(comment: Comment): void {
    this.selectedComment = comment;
  }

  handleCommentCardClick(comment: Comment): void {
    this.viewComment(comment);
  }

  closePreview(): void {
    this.selectedComment = undefined;
  }

  approveComment(comment: Comment): void {
    this.actionLoadingId = comment.id;
    this.actionMessage = '';

    this.commentService.approveComment(comment.id).subscribe({
      next: (updatedComment) => {
        this.replaceComment(updatedComment);
        this.actionMessage = 'Comentario aprovado e liberado na materia.';
      },
      error: (err: any) => {
        this.error = 'Erro ao aprovar comentario: ' + (err.error?.message || err.message);
        this.actionLoadingId = null;
      }
    });
  }

  rejectComment(comment: Comment): void {
    this.actionLoadingId = comment.id;
    this.actionMessage = '';

    this.commentService.rejectComment(comment.id).subscribe({
      next: (updatedComment) => {
        this.replaceComment(updatedComment);
        this.actionMessage = 'Comentario rejeitado. Ele sera removido definitivamente depois de 10 dias.';
      },
      error: (err: any) => {
        this.error = 'Erro ao rejeitar comentario: ' + (err.error?.message || err.message);
        this.actionLoadingId = null;
      }
    });
  }

  requestDeleteComment(comment: Comment): void {
    this.pendingDeleteComment = comment;
    this.actionMessage = '';
  }

  cancelDeleteComment(): void {
    this.pendingDeleteComment = undefined;
  }

  confirmDeleteComment(): void {
    const comment = this.pendingDeleteComment;

    if (!comment) {
      return;
    }

    this.actionLoadingId = comment.id;

    this.commentService.deleteComment(comment.id).subscribe({
      next: () => {
        this.replaceComment({
          ...comment,
          status: 'APAGADO',
          rawStatus: 'DELETED'
        });
        this.pendingDeleteComment = undefined;
        this.actionMessage = 'Comentario marcado como apagado. Ele sera removido definitivamente depois de 10 dias.';
      },
      error: (err: any) => {
        this.error = 'Erro ao apagar comentario: ' + (err.error?.message || err.message);
        this.actionLoadingId = null;
      }
    });
  }

  getFilterCount(status: CommentFilterStatus): number {
    return this.filterCounts[status] ?? 0;
  }

  getArticleCover(comment: Comment): string | null {
    return buildAssetUrl(comment.articleCoverImageUrl) ?? null;
  }

  getPublicationLink(comment: Comment): string | null {
    return comment.articleSlug ? `/noticia/${comment.articleSlug}` : null;
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    this.filteredComments = this.comments.filter((comment) => {
      const matchesStatus = this.activeStatus === 'ALL' || comment.rawStatus === this.activeStatus;
      const matchesSearch = !normalizedSearch
        || comment.author.toLowerCase().includes(normalizedSearch)
        || comment.email.toLowerCase().includes(normalizedSearch)
        || comment.content.toLowerCase().includes(normalizedSearch)
        || comment.articleTitle.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });

    if (this.selectedComment) {
      this.selectedComment = this.comments.find((comment) => comment.id === this.selectedComment?.id);
    }
  }

  private loadFilterCounts(): void {
    this.filters.forEach((filter) => {
      this.commentService.getAdminCommentsPage(
        filter.status,
        0,
        1,
        this.articleFilter,
        this.dateFrom,
        this.dateTo
      ).subscribe({
        next: (response) => {
          this.filterCounts[filter.status] = response.totalElements;
        },
        error: () => {
          this.filterCounts[filter.status] = 0;
        }
      });
    });
  }

  private replaceComment(updatedComment: Comment): void {
    this.comments = this.comments.map((comment) => comment.id === updatedComment.id ? updatedComment : comment);
    this.actionLoadingId = null;
    this.applyFilters();
    this.selectedComment = updatedComment;
    this.loadFilterCounts();
  }
}


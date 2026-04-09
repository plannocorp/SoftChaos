import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Comment, CommentFilterStatus } from '../../../../../models/comment';
import { CommentService } from '../../../../../services/comment-service';

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
  private readonly backendBaseUrl = 'http://localhost:8080';

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
  activeStatus: CommentFilterStatus = 'ALL';
  searchTerm = '';
  error = '';
  loading = false;
  actionLoadingId: number | null = null;

  constructor(private commentService: CommentService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    this.error = '';

    this.commentService.getAdminComments('ALL').subscribe({
      next: (comments) => {
        this.comments = comments;
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
    this.applyFilters();
  }

  filterComments(): void {
    this.applyFilters();
  }

  viewComment(comment: Comment): void {
    this.selectedComment = comment;
  }

  closePreview(): void {
    this.selectedComment = undefined;
  }

  approveComment(comment: Comment): void {
    this.actionLoadingId = comment.id;

    this.commentService.approveComment(comment.id).subscribe({
      next: (updatedComment) => {
        this.replaceComment(updatedComment);
      },
      error: (err: any) => {
        this.error = 'Erro ao aprovar comentario: ' + (err.error?.message || err.message);
        this.actionLoadingId = null;
      }
    });
  }

  rejectComment(comment: Comment): void {
    this.actionLoadingId = comment.id;

    this.commentService.rejectComment(comment.id).subscribe({
      next: (updatedComment) => {
        this.replaceComment(updatedComment);
      },
      error: (err: any) => {
        this.error = 'Erro ao rejeitar comentario: ' + (err.error?.message || err.message);
        this.actionLoadingId = null;
      }
    });
  }

  deleteComment(comment: Comment): void {
    if (!window.confirm('Deseja marcar este comentario como apagado?')) {
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
      },
      error: (err: any) => {
        this.error = 'Erro ao apagar comentario: ' + (err.error?.message || err.message);
        this.actionLoadingId = null;
      }
    });
  }

  getFilterCount(status: CommentFilterStatus): number {
    if (status === 'ALL') {
      return this.comments.length;
    }

    return this.comments.filter((comment) => comment.rawStatus === status).length;
  }

  getArticleCover(comment: Comment): string | null {
    const coverImageUrl = comment.articleCoverImageUrl;

    if (!coverImageUrl) {
      return null;
    }

    if (coverImageUrl.startsWith('http://') || coverImageUrl.startsWith('https://')) {
      return coverImageUrl;
    }

    return `${this.backendBaseUrl}${coverImageUrl.startsWith('/') ? coverImageUrl : `/${coverImageUrl}`}`;
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

  private replaceComment(updatedComment: Comment): void {
    this.comments = this.comments.map((comment) => comment.id === updatedComment.id ? updatedComment : comment);
    this.actionLoadingId = null;
    this.applyFilters();
    this.selectedComment = updatedComment;
  }
}


import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CommentService } from '../../../../../services/comment-service';
import { CommentResponse } from '../../../../../models/comment-response';
import { PagedResponse } from '../../../../../models/paged-response';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, DatePipe],
  templateUrl: './comments.html',
  styleUrls: ['./comments.css']
})
export class Comments implements OnInit {
  comments: CommentResponse[] = [];
  filteredComments: CommentResponse[] = []; // para compatibilidade com o template (filtro local removido, mas mantemos para não quebrar)
  searchTerm = '';
  error = '';
  loading = false;

  // Paginação
  currentPage = 0;
  pageSize = 20;
  totalElements = 0;
  totalPages = 0;

  private searchSubject = new Subject<string>();

  constructor(
    private commentService: CommentService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadComments();
    this.setupSearchDebounce();
  }

  setupSearchDebounce() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((search) => this.commentService.getPendingComments(0, this.pageSize, search))
    ).subscribe({
      next: (response: PagedResponse<CommentResponse>) => {
        this.comments = response.content;
        this.filteredComments = [...this.comments];
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.pageNumber;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Erro no debounce:', err)
    });
  }

  loadComments(page: number = 0) {
    this.loading = true;
    this.error = '';

    this.commentService.getPendingComments(page, this.pageSize, this.searchTerm).subscribe({
      next: (response: PagedResponse<CommentResponse>) => {
        this.comments = response.content;
        this.filteredComments = [...this.comments];
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.currentPage = response.pageNumber;
        this.loading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.error = 'Erro ao carregar comentários: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchTerm);
    this.currentPage = 0;
  }

  approveComment(id: number) {
    if (confirm('Aprovar este comentário?')) {
      this.commentService.approveComment(id).subscribe({
        next: (updated: CommentResponse) => {
          // Atualiza localmente
          const index = this.comments.findIndex(c => c.id === id);
          if (index !== -1) this.comments[index] = updated;
          this.filteredComments = [...this.comments];
        },
        error: (err) => {
          this.error = 'Erro ao aprovar: ' + (err.error?.message || err.message);
        }
      });
    }
  }

  rejectComment(id: number) {
    if (confirm('Rejeitar este comentário?')) {
      this.commentService.rejectComment(id).subscribe({
        next: (updated: CommentResponse) => {
          const index = this.comments.findIndex(c => c.id === id);
          if (index !== -1) this.comments[index] = updated;
          this.filteredComments = [...this.comments];
        },
        error: (err) => {
          this.error = 'Erro ao rejeitar: ' + (err.error?.message || err.message);
        }
      });
    }
  }

  deleteComment(id: number) {
    if (confirm('Excluir permanentemente?')) {
      this.commentService.deleteComment(id).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== id);
          this.filteredComments = [...this.comments];
          this.totalElements--;
          if (this.comments.length === 0 && this.currentPage > 0) {
            this.loadComments(this.currentPage - 1);
          }
        },
        error: (err) => {
          this.error = 'Erro ao excluir: ' + (err.error?.message || err.message);
        }
      });
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.loadComments(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.loadComments(this.currentPage + 1);
    }
  }
}

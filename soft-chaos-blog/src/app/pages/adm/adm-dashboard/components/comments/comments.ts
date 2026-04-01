import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CommentService } from '../../../../../services/comment-service';
import { Comment } from '../../../../../models/comment';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, DatePipe],
  templateUrl: './comments.html',
  styleUrls: ['./comments.css']
})
export class Comments implements OnInit {
  comments: Comment[] = [];
  filteredComments: Comment[] = [];
  searchTerm = '';
  statusFilter = '';
  error = '';
  loading = false;

  private searchSubject = new Subject<void>();

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
      switchMap(() => this.commentService.getPendingComments(0, 50, this.searchTerm))
    ).subscribe({
      next: (comments: Comment[]) => {
        this.comments = comments;
        this.filteredComments = [...comments];
        this.filterComments();
      },
      error: (err: any) => {
        console.error('Erro no debounce:', err);
      }
    });
  }

  loadComments() {
    this.loading = true;
    this.error = '';

    this.commentService.getPendingComments(0, 50).subscribe({
      next: (comments: Comment[]) => {
        this.comments = comments;
        this.filteredComments = [...comments];
        this.loading = false;
        this.filterComments();
        this.cd.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Erro ao carregar comentários: ' + (err.error?.message || err.message);
        this.loading = false;
        console.error(err);
      }
    });
  }

  filterComments() {
    let filtered = [...this.comments];
    
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(comment =>
        comment.author.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        comment.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        comment.articleTitle.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(comment => comment.status === this.statusFilter);
    }

    this.filteredComments = filtered;
  }

  onSearchChange() {
    this.searchSubject.next();
  }

  approveComment(id: number) {
    if (confirm('Aprovar este comentário?')) {
      this.commentService.approveComment(id).subscribe({
        next: (updated: Comment) => {
          const index = this.comments.findIndex(c => c.id === id);
          if (index !== -1) {
            this.comments[index] = updated;
            this.filterComments();
          }
        },
        error: (err: any) => {
          this.error = 'Erro ao aprovar: ' + (err.error?.message || err.message);
        }
      });
    }
  }

  rejectComment(id: number) {
    if (confirm('Rejeitar este comentário?')) {
      this.commentService.rejectComment(id).subscribe({
        next: (updated: Comment) => {
          const index = this.comments.findIndex(c => c.id === id);
          if (index !== -1) {
            this.comments[index] = updated;
            this.filterComments();
          }
        },
        error: (err: any) => {
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
          this.filterComments();
        },
        error: (err: any) => {
          this.error = 'Erro ao excluir: ' + (err.error?.message || err.message);
        }
      });
    }
  }
}
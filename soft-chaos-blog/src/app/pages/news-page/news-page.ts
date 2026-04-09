import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { News } from '../../models/news';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { PublicArticleService } from '../../services/public-article-service';
import { CommentService } from '../../services/comment-service';
import { Comment, CreateCommentRequest } from '../../models/comment';

@Component({
  selector: 'app-news-page',
  imports: [CommonModule, FormsModule, Header, Footer],
  templateUrl: './news-page.html',
  styleUrl: './news-page.css',
})
export class NewsPage implements OnInit {
  public news?: News;
  public loading: boolean = true;
  public notFound: boolean = false;
  public comments: Comment[] = [];
  public commentsLoading: boolean = false;
  public commentError: string = '';
  public commentSuccess: string = '';
  public submittingComment: boolean = false;
  public commentForm: CreateCommentRequest = {
    authorName: '',
    authorEmail: '',
    content: '',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicArticleService: PublicArticleService,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  private loadNews(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.publicArticleService.getArticleBySlug(slug).subscribe({
      next: (news) => {
        this.news = news;
        this.notFound = false;
        this.loading = false;
        if (typeof news.id === 'number') {
          this.loadComments(news.id);
        } else {
          this.comments = [];
        }
      },
      error: () => {
        this.news = undefined;
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }

  public submitComment(): void {
    if (!this.news || typeof this.news.id !== 'number' || this.submittingComment || !this.isCommentFormValid()) {
      if (!this.isCommentFormValid()) {
        this.commentError = 'Preencha nome, email e comentario antes de enviar.';
      }
      return;
    }

    this.submittingComment = true;
    this.commentError = '';
    this.commentSuccess = '';

    this.commentService.createComment(this.news.id, this.commentForm).subscribe({
      next: () => {
        this.commentSuccess = 'Comentario enviado com sucesso. Ele ficara visivel apos aprovacao.';
        this.commentForm = {
          authorName: '',
          authorEmail: '',
          content: '',
        };
        this.submittingComment = false;
      },
      error: (err) => {
        this.commentError = err.error?.message || 'Nao foi possivel enviar seu comentario agora.';
        this.submittingComment = false;
      }
    });
  }

  private loadComments(articleId: number): void {
    this.commentsLoading = true;
    this.commentError = '';

    this.commentService.getApprovedCommentsByArticle(articleId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.commentsLoading = false;
      },
      error: (err) => {
        this.commentError = err.error?.message || 'Nao foi possivel carregar os comentarios.';
        this.commentsLoading = false;
      }
    });
  }

  private isCommentFormValid(): boolean {
    return Boolean(
      this.commentForm.authorName.trim() &&
      this.commentForm.authorEmail.trim() &&
      this.commentForm.content.trim()
    );
  }
}

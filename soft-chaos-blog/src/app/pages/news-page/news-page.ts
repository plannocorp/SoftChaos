import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { NewsService } from '../../services/news-service';
import { CommentService } from '../../services/comment-service';
import { CommentResponse } from '../../models/comment-response';
import { ArticleResponse } from '../../models/article-response';
import { CreateCommentRequest } from '../../models/create-comment-request';

@Component({
  selector: 'app-news-page',
  imports: [CommonModule, Header, Footer, FormsModule],
  templateUrl: './news-page.html',
  styleUrl: './news-page.css',
})
export class NewsPage implements OnInit {
  public news?: ArticleResponse;
  public loading = true;
  public notFound = false;

  public comments: CommentResponse[] = [];
  public commentsPage = 0;
  public commentsTotalPages = 0;
  public commentsTotalElements = 0;
  public commentsLoading = false;

  public newComment: CreateCommentRequest = {
    articleId: 0,
    authorName: '',
    authorEmail: '',
    content: ''
  };

  public submittingComment = false;
  public commentError: string | null = null;
  public commentSuccess: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
    private commentService: CommentService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  private loadNews(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.notFound = true;
      this.loading = false;
      this.cd.detectChanges();
      return;
    }

    this.newsService.getBySlug(slug).subscribe({
      next: (article) => {
        if (!article) {
          this.notFound = true;
          this.loading = false;
          this.cd.detectChanges();
          return;
        }

        this.news = article;
        this.newComment.articleId = article.id;
        this.loading = false;
        this.cd.detectChanges();
        this.loadComments();
      },
      error: (err) => {
        console.error('Erro ao carregar notícia', err);
        this.notFound = true;
        this.loading = false;
        this.cd.detectChanges();
      }
    });
  }

  private loadComments(): void {
    if (!this.news) return;

    this.commentsLoading = true;
    this.cd.detectChanges();

    this.commentService.getCommentsByArticle(this.news.id, this.commentsPage, 10).subscribe({
      next: (paged) => {
        this.comments = paged.content;
        this.commentsTotalPages = paged.totalPages;
        this.commentsTotalElements = paged.totalElements;
        this.commentsLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar comentários', err);
        this.commentsLoading = false;
        this.cd.detectChanges();
      }
    });
  }

  public submitComment(): void {
    if (!this.newComment.authorName.trim() || !this.newComment.authorEmail.trim() || !this.newComment.content.trim()) {
      this.commentError = 'Preencha todos os campos.';
      this.cd.detectChanges();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newComment.authorEmail)) {
      this.commentError = 'E-mail inválido.';
      this.cd.detectChanges();
      return;
    }

    this.submittingComment = true;
    this.commentError = null;
    this.commentSuccess = null;
    this.cd.detectChanges();

    this.commentService.createComment(this.newComment).subscribe({
      next: () => {
        this.commentSuccess = 'Comentário enviado para aprovação.';
        this.newComment.content = '';
        this.newComment.authorName = '';
        this.newComment.authorEmail = '';
        this.commentsPage = 0;
        this.submittingComment = false;
        this.cd.detectChanges();
        this.loadComments();
      },
      error: (err) => {
        console.error('Erro ao enviar comentário', err);
        this.commentError = 'Erro ao enviar comentário. Tente novamente.';
        this.submittingComment = false;
        this.cd.detectChanges();
      }
    });
  }

  public previousCommentsPage(): void {
    if (this.commentsPage > 0) {
      this.commentsPage--;
      this.loadComments();
    }
  }

  public nextCommentsPage(): void {
    if (this.commentsPage + 1 < this.commentsTotalPages) {
      this.commentsPage++;
      this.loadComments();
    }
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }
}

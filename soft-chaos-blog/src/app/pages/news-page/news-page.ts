import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  public loading: boolean = true;
  public notFound: boolean = false;

  // Comentários
  public comments: CommentResponse[] = [];
  public commentsPage: number = 0;
  public commentsTotalPages: number = 0;
  public commentsTotalElements: number = 0;
  public commentsLoading: boolean = false;
  public newComment: CreateCommentRequest = {
    articleId: 0,
    authorName: '',
    authorEmail: '',
    content: ''
  };
  public submittingComment: boolean = false;
  public commentError: string | null = null;
  public commentSuccess: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
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

    this.newsService.getBySlug(slug).subscribe({
      next: (article) => {
        this.news = article;
        this.newComment.articleId = article.id;
        this.loading = false;
        this.loadComments();
      },
      error: (err) => {
        console.error('Erro ao carregar notícia', err);
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  private loadComments(): void {
    if (!this.news) return;
    this.commentsLoading = true;
    this.commentService.getCommentsByArticle(this.news.id, this.commentsPage, 10).subscribe({
      next: (paged) => {
        this.comments = paged.content;
        this.commentsTotalPages = paged.totalPages;
        this.commentsTotalElements = paged.totalElements;
        this.commentsLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar comentários', err);
        this.commentsLoading = false;
      }
    });
  }

  public submitComment(): void {
    if (!this.newComment.authorName.trim() || !this.newComment.authorEmail.trim() || !this.newComment.content.trim()) {
      this.commentError = 'Preencha todos os campos.';
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newComment.authorEmail)) {
      this.commentError = 'E-mail inválido.';
      return;
    }

    this.submittingComment = true;
    this.commentError = null;
    this.commentSuccess = null;

    this.commentService.createComment(this.newComment).subscribe({
      next: () => {
        this.commentSuccess = 'Comentário enviado para aprovação.';
        this.newComment.content = '';
        this.newComment.authorName = '';
        this.newComment.authorEmail = '';
        // Recarregar comentários (página 0)
        this.commentsPage = 0;
        this.loadComments();
        this.submittingComment = false;
        setTimeout(() => this.commentSuccess = null, 5000);
      },
      error: (err) => {
        console.error('Erro ao enviar comentário', err);
        this.commentError = 'Erro ao enviar comentário. Tente novamente.';
        this.submittingComment = false;
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

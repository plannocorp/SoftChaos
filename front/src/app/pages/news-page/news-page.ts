import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MediaItem, News } from '../../models/news';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { PublicArticleService } from '../../services/public-article-service';
import { CommentService } from '../../services/comment-service';
import { Comment, CreateCommentRequest } from '../../models/comment';
import { Subscription } from 'rxjs';
import { LoadingIndicator } from '../../components/shared/loading-indicator/loading-indicator';
import { ProgressiveImage } from '../../components/shared/progressive-image/progressive-image';

interface ExternalVideoLinkView {
  url: string;
  platform: 'YouTube' | 'Instagram' | 'Link';
  label: string;
  previewImageUrl?: string;
  modalEmbedUrl?: SafeResourceUrl;
}

@Component({
  selector: 'app-news-page',
  imports: [CommonModule, FormsModule, Header, Footer, LoadingIndicator, ProgressiveImage],
  templateUrl: './news-page-editorial.html',
  styleUrl: './news-page-editorial.css',
})
export class NewsPage implements OnInit, OnDestroy {
  public news?: News;
  public loading: boolean = true;
  public notFound: boolean = false;
  public comments: Comment[] = [];
  public commentsLoading: boolean = false;
  public commentError: string = '';
  public commentSuccess: string = '';
  public submittingComment: boolean = false;
  public pageError: string = '';
  public selectedGalleryMedia?: { url: string; alt: string; type: 'IMAGE' | 'VIDEO' };
  public selectedGalleryIndex: number = -1;
  public selectedExternalVideo?: ExternalVideoLinkView;
  public commentForm: CreateCommentRequest = {
    authorName: '',
    authorEmail: '',
    content: '',
  };
  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicArticleService: PublicArticleService,
    private commentService: CommentService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(() => {
      this.loadNews();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  private loadNews(): void {
    this.loading = true;
    this.notFound = false;
    this.pageError = '';
    this.comments = [];
    this.commentError = '';
    this.commentSuccess = '';

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
      error: (err: HttpErrorResponse) => {
        this.news = undefined;
        this.notFound = err.status === 404;
        this.pageError = err.status !== 404
          ? 'Nao foi possivel carregar esta noticia agora. Tente novamente em instantes.'
          : '';
        this.loading = false;
      }
    });
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }

  public getHeroVideo(): MediaItem | undefined {
    if (this.news?.imageURL) {
      return undefined;
    }

    return this.news?.mediaItems?.find((item) => item.type === 'VIDEO');
  }

  public getGalleryMedia(): MediaItem[] {
    const mediaItems = this.news?.mediaItems ?? [];
    if (!mediaItems.length) {
      return [];
    }

    const heroVideo = this.getHeroVideo();
    let skippedHeroImage = false;

    return mediaItems.filter((item) => {
      if (item.type === 'DOCUMENT') {
        return false;
      }

      if (this.news?.imageURL && item.type === 'IMAGE' && item.url === this.news.imageURL && !skippedHeroImage) {
        skippedHeroImage = true;
        return false;
      }

      if (!this.news?.imageURL && heroVideo && item.id === heroVideo.id) {
        return false;
      }

      return true;
    });
  }

  public trackMedia(_index: number, media: MediaItem): number {
    return media.id;
  }

  public openGalleryItem(media: MediaItem): void {
    const galleryMedia = this.getGalleryMedia();
    const mediaIndex = galleryMedia.findIndex((item) => item.id === media.id);
    this.selectedGalleryIndex = mediaIndex >= 0 ? mediaIndex : 0;
    this.setSelectedGalleryMedia(media);
  }

  public showPreviousGalleryItem(): void {
    const galleryMedia = this.getGalleryMedia();
    if (galleryMedia.length < 2) {
      return;
    }

    this.selectedGalleryIndex = (this.selectedGalleryIndex - 1 + galleryMedia.length) % galleryMedia.length;
    this.setSelectedGalleryMedia(galleryMedia[this.selectedGalleryIndex]);
  }

  public showNextGalleryItem(): void {
    const galleryMedia = this.getGalleryMedia();
    if (galleryMedia.length < 2) {
      return;
    }

    this.selectedGalleryIndex = (this.selectedGalleryIndex + 1) % galleryMedia.length;
    this.setSelectedGalleryMedia(galleryMedia[this.selectedGalleryIndex]);
  }

  private setSelectedGalleryMedia(media: MediaItem): void {
    this.selectedGalleryMedia = {
      url: media.url,
      alt: media.altText || this.news?.title || 'Midia do artigo',
      type: media.type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    };
  }

  public closeGalleryItem(): void {
    this.selectedGalleryMedia = undefined;
    this.selectedGalleryIndex = -1;
  }

  public openExternalVideo(video: ExternalVideoLinkView): void {
    if (video.modalEmbedUrl) {
      this.selectedExternalVideo = video;
      return;
    }

    window.open(video.url, '_blank', 'noopener,noreferrer');
  }

  public closeExternalVideo(): void {
    this.selectedExternalVideo = undefined;
  }

  public getExternalVideoLinks(): ExternalVideoLinkView[] {
    return (this.news?.externalVideoLinks ?? [])
      .map((link) => this.mapExternalVideoLink(link))
      .filter((link): link is ExternalVideoLinkView => Boolean(link));
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

  private mapExternalVideoLink(link: string): ExternalVideoLinkView | undefined {
    const normalizedLink = link.trim();

    if (!normalizedLink) {
      return undefined;
    }

    const youtubeEmbedUrl = this.buildYoutubeEmbedUrl(normalizedLink);
    if (youtubeEmbedUrl) {
      const youtubeThumbnail = this.buildYoutubeThumbnailUrl(youtubeEmbedUrl);
      return {
        url: normalizedLink,
        platform: 'YouTube',
        label: 'Assistir no YouTube',
        previewImageUrl: youtubeThumbnail,
        modalEmbedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(`${youtubeEmbedUrl}?autoplay=1&rel=0`),
      };
    }

    if (this.isInstagramUrl(normalizedLink)) {
      return {
        url: normalizedLink,
        platform: 'Instagram',
        label: 'Abrir no Instagram',
        previewImageUrl: 'https://placehold.co/1200x675/111111/ffffff?text=Instagram',
      };
    }

    return {
      url: normalizedLink,
      platform: 'Link',
      label: this.buildGenericExternalLinkLabel(normalizedLink),
      previewImageUrl: 'https://placehold.co/1200x675/111111/ffffff?text=Link',
    };
  }

  private buildGenericExternalLinkLabel(link: string): string {
    try {
      const parsedUrl = new URL(link);
      return `Abrir ${parsedUrl.hostname.replace(/^www\./, '')}`;
    } catch {
      return 'Abrir link';
    }
  }

  private buildYoutubeEmbedUrl(link: string): string | null {
    try {
      const parsedUrl = new URL(link);
      const host = parsedUrl.hostname.toLowerCase();

      if (host === 'youtu.be' || host === 'www.youtu.be') {
        const videoId = parsedUrl.pathname.replace('/', '').trim();
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com') {
        const videoId = parsedUrl.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }

      return null;
    } catch {
      return null;
    }
  }

  private buildYoutubeThumbnailUrl(embedUrl: string): string | undefined {
    const videoId = embedUrl.split('/embed/')[1]?.split('?')[0]?.trim();
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined;
  }

  private isInstagramUrl(link: string): boolean {
    try {
      const parsedUrl = new URL(link);
      const host = parsedUrl.hostname.toLowerCase();
      return host === 'instagram.com' || host === 'www.instagram.com';
    } catch {
      return false;
    }
  }
}

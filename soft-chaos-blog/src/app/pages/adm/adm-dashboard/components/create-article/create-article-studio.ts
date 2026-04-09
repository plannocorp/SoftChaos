import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Category } from '../../../../../models/category';
import { ApiEnvelope, ArticleApi, CreateArticleRequest, MediaItem } from '../../../../../models/news';
import { AuthService } from '../../../../../services/auth';
import { NewsService } from '../../../../../services/news-service';

interface SelectedImageFile {
  file: File;
  previewUrl: string;
  altText: string;
  isCover: boolean;
  sizeLabel: string;
}

interface UploadedImageResult {
  media: SelectedImageFile;
  response: MediaItem;
}

interface FailedUpload {
  media: SelectedImageFile;
  message: string;
}

@Component({
  selector: 'app-create-article-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-article-studio.html',
  styleUrl: './create-article-studio.css',
})
export class CreateArticleStudio implements OnInit, OnDestroy {
  private readonly maxMediaItems = 5;
  private readonly maxUploadSizeBytes = 200 * 1024 * 1024;
  private readonly maxExternalLinks = 5;

  article: CreateArticleRequest = {
    title: '',
    summary: '',
    content: '',
    categoryId: null,
    status: 'DRAFT',
    tagIds: [],
    featured: false,
    pinned: false,
    scheduledFor: null,
    externalVideoLinks: [],
  };

  selectedMedia: SelectedImageFile[] = [];
  existingMedia: MediaItem[] = [];
  externalVideoLinks: string[] = [''];
  private originalExternalVideoLinks: string[] = [];
  publishAtString = '';
  loading = false;
  loadingCategories = false;
  loadingArticle = false;
  currentArticleId: number | null = null;
  selectedExistingCoverUrl: string | null = null;
  error = '';
  warningMessage = '';
  progressMessage = '';
  minDate = this.toLocalDateTimeInputValue(new Date());
  userName = '';
  categories: Category[] = [];

  constructor(
    private http: HttpClient,
    private newsService: NewsService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get isEditMode(): boolean {
    return this.currentArticleId !== null;
  }

  get externalVideoLinkCount(): number {
    return this.externalVideoLinks.filter((link) => link.trim()).length;
  }

  get statusBoardRoute(): string {
    switch (this.article.status) {
      case 'PUBLISHED':
        return '/security/adimin-dashboard/published';
      case 'SCHEDULED':
        return '/security/adimin-dashboard/scheduled';
      default:
        return '/security/adimin-dashboard/drafts';
    }
  }

  get statusLabel(): string {
    switch (this.article.status) {
      case 'PUBLISHED':
        return 'Publicado';
      case 'SCHEDULED':
        return 'Agendado';
      default:
        return 'Rascunho';
    }
  }

  get statusDescription(): string {
    switch (this.article.status) {
      case 'PUBLISHED':
        return 'O artigo sera enviado direto para o portal assim que voce salvar.';
      case 'SCHEDULED':
        return 'O conteudo ficara programado para entrar no ar automaticamente na data definida.';
      default:
        return 'Perfeito para revisar texto, imagens e links antes de publicar.';
    }
  }

  async ngOnInit(): Promise<void> {
    this.userName = this.authService.getUserName() || 'Autor autenticado';
    this.publishAtString = this.toLocalDateTimeInputValue(new Date());
    await this.loadCategories();

    const articleId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isNaN(articleId) && articleId > 0) {
      await this.loadArticle(articleId);
    }
  }

  ngOnDestroy(): void {
    this.revokeAllPreviews();
  }

  async loadCategories(): Promise<void> {
    this.loadingCategories = true;

    try {
      const categories = await firstValueFrom(this.newsService.getCategories());
      this.categories = categories || [];
    } catch (err) {
      console.error('Erro ao carregar categorias', err);
      this.error = 'Erro ao carregar categorias.';
    } finally {
      this.loadingCategories = false;
      this.cd.detectChanges();
    }
  }

  async loadArticle(articleId: number): Promise<void> {
    this.loadingArticle = true;
    this.error = '';

    try {
      const response = await firstValueFrom(this.http.get<ApiEnvelope<ArticleApi>>(`/api/articles/${articleId}`));
      const article = response.data;

      this.currentArticleId = article.id;
      this.article = {
        title: article.title,
        summary: article.summary || '',
        content: article.content,
        categoryId: article.category?.id ?? null,
        status: article.status === 'ARCHIVED' ? 'DRAFT' : (article.status ?? 'DRAFT'),
        tagIds: [],
        featured: article.featured ?? false,
        pinned: article.pinned ?? false,
        scheduledFor: article.scheduledFor ?? null,
        coverImageUrl: article.coverImageUrl,
        externalVideoLinks: article.externalVideoLinks || [],
      };
      this.externalVideoLinks = article.externalVideoLinks?.length ? [...article.externalVideoLinks] : [''];
      this.originalExternalVideoLinks = article.externalVideoLinks?.length ? [...article.externalVideoLinks] : [];
      this.publishAtString = article.scheduledFor
        ? this.toLocalDateTimeInputValue(new Date(article.scheduledFor))
        : this.toLocalDateTimeInputValue(new Date());
      this.selectedExistingCoverUrl = article.coverImageUrl || null;
      this.existingMedia = article.mediaFiles || [];
    } catch (err) {
      console.error('Erro ao carregar artigo', err);
      this.error = 'Nao foi possivel carregar o artigo para edicao.';
    } finally {
      this.loadingArticle = false;
      this.cd.detectChanges();
    }
  }

  onMediaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    this.clearMessages();
    this.addMediaFiles(files);
    input.value = '';
  }

  addVideoLink(): void {
    if (this.externalVideoLinks.length >= this.maxExternalLinks) {
      this.warningMessage = 'Voce pode adicionar no maximo 5 links externos.';
      return;
    }

    this.externalVideoLinks = [...this.externalVideoLinks, ''];
  }

  removeVideoLink(index: number): void {
    if (this.externalVideoLinks.length === 1) {
      this.externalVideoLinks = [''];
      return;
    }

    this.externalVideoLinks = this.externalVideoLinks.filter((_, linkIndex) => linkIndex !== index);
  }

  normalizeVideoLink(index: number): void {
    const value = this.externalVideoLinks[index];
    this.externalVideoLinks[index] = this.normalizeExternalLink(value);
  }

  removeMedia(index: number): void {
    const [removed] = this.selectedMedia.splice(index, 1);
    if (removed) {
      URL.revokeObjectURL(removed.previewUrl);
    }

    this.ensureCoverSelection();
  }

  async removeExistingMedia(mediaId: number): Promise<void> {
    if (!window.confirm('Deseja remover esta imagem do artigo?')) {
      return;
    }

    try {
      await firstValueFrom(this.http.delete(`/api/media/${mediaId}`));
      this.existingMedia = this.existingMedia.filter((media) => media.id !== mediaId);

      if (this.selectedExistingCoverUrl && !this.existingMedia.find((media) => media.url === this.selectedExistingCoverUrl)) {
        this.selectedExistingCoverUrl = this.existingMedia[0]?.url || null;
      }
    } catch (error: any) {
      this.error = this.extractRequestError(error, 'Nao foi possivel remover esta imagem.');
    }
  }

  setExistingCover(url: string): void {
    this.selectedExistingCoverUrl = url;
    this.selectedMedia = this.selectedMedia.map((media) => ({ ...media, isCover: false }));
  }

  clearMedia(): void {
    this.revokeAllPreviews();
    this.selectedMedia = [];
  }

  setCover(index: number): void {
    const candidate = this.selectedMedia[index];
    if (!candidate) {
      return;
    }

    this.selectedExistingCoverUrl = null;
    this.selectedMedia = this.selectedMedia.map((media, mediaIndex) => ({
      ...media,
      isCover: mediaIndex === index,
    }));
  }

  async saveArticle(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    try {
      this.progressMessage = this.currentArticleId
        ? 'Salvando alteracoes e enviando imagens pendentes...'
        : 'Criando a materia no portal...';

      const articleId = await this.persistArticle();
      this.currentArticleId = articleId;

      const uploadResult = await this.uploadSelectedMedia(articleId);

      if (uploadResult.failedUploads.length) {
        this.selectedMedia = uploadResult.failedUploads.map((failure) => failure.media);
        this.ensureCoverSelection();
        this.warningMessage = this.buildUploadWarning(articleId, uploadResult.failedUploads);
        return;
      }

      this.router.navigate([this.statusBoardRoute]);
    } catch (err: any) {
      console.error('Erro ao salvar artigo', err);
      this.error = this.extractRequestError(
        err,
        this.currentArticleId
          ? 'O artigo foi salvo parcialmente, mas houve erro ao concluir o envio das imagens.'
          : 'Erro ao criar artigo.'
      );
    } finally {
      this.progressMessage = '';
      this.loading = false;
    }
  }

  validateForm(): boolean {
    if (!this.article.title.trim()) {
      this.error = 'Titulo obrigatorio.';
      return false;
    }

    if (!this.article.categoryId) {
      this.error = 'Categoria obrigatoria.';
      return false;
    }

    if (this.article.status === 'SCHEDULED' && !this.publishAtString) {
      this.error = 'Data de publicacao obrigatoria.';
      return false;
    }

    if (this.article.status === 'SCHEDULED') {
      const scheduledDate = new Date(this.publishAtString);
      if (Number.isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
        this.error = 'Escolha uma data futura para o agendamento.';
        return false;
      }
    }

    if (!this.article.content.trim()) {
      this.error = 'Conteudo obrigatorio.';
      return false;
    }

    if (this.selectedMedia.length + this.existingMedia.length > this.maxMediaItems) {
      this.error = 'Voce pode manter no maximo 5 imagens por artigo.';
      return false;
    }

    const normalizedLinks = this.getNormalizedVideoLinks();
    if (normalizedLinks.length > this.maxExternalLinks) {
      this.error = 'Voce pode adicionar no maximo 5 links externos.';
      return false;
    }

    const invalidLink = normalizedLinks.find((link) => !this.isSupportedVideoLink(link));
    if (invalidLink) {
      this.error = 'Use apenas links validos do YouTube ou Instagram.';
      return false;
    }

    return true;
  }

  private addMediaFiles(files: File[]): void {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (!imageFiles.length) {
      this.error = 'Selecione apenas imagens.';
      return;
    }

    const oversizedFiles = imageFiles.filter((file) => file.size > this.maxUploadSizeBytes);
    const validFiles = imageFiles.filter((file) => file.size <= this.maxUploadSizeBytes);
    const warnings: string[] = [];

    if (oversizedFiles.length) {
      warnings.push(`${oversizedFiles.map((file) => file.name).join(', ')} excede(m) o limite de 200 MB por imagem.`);
    }

    if (!validFiles.length) {
      this.warningMessage = warnings.join(' ');
      return;
    }

    const remainingSlots = this.maxMediaItems - this.selectedMedia.length - this.existingMedia.length;
    if (remainingSlots <= 0) {
      this.error = 'Cada artigo pode ter no maximo 5 imagens.';
      return;
    }

    const acceptedFiles = validFiles.slice(0, remainingSlots);
    if (acceptedFiles.length < validFiles.length) {
      warnings.push('Algumas imagens foram ignoradas porque o limite total do artigo e de 5 arquivos.');
    }

    const existingCount = this.selectedMedia.length + this.existingMedia.length;
    acceptedFiles.forEach((file, index) => {
      this.selectedMedia.push({
        file,
        previewUrl: URL.createObjectURL(file),
        altText: this.buildDefaultAltText(existingCount + index + 1),
        isCover: false,
        sizeLabel: this.formatFileSize(file.size),
      });
    });

    this.ensureCoverSelection();
    this.warningMessage = warnings.join(' ');
  }

  private async persistArticle(): Promise<number> {
    const articlePayload = this.buildArticlePayload();

    if (this.currentArticleId) {
      await firstValueFrom(this.http.put(`/api/articles/${this.currentArticleId}`, articlePayload));
      return this.currentArticleId;
    }

    const articleRes: any = await firstValueFrom(this.http.post('/api/articles', articlePayload));
    return articleRes.data.id;
  }

  private buildArticlePayload(): CreateArticleRequest {
    const payload: CreateArticleRequest = {
      ...this.article,
      summary: this.article.summary?.trim() || this.article.title.trim().slice(0, 150),
      scheduledFor: this.article.status === 'SCHEDULED' ? this.publishAtString : null,
      coverImageUrl: this.selectedExistingCoverUrl || this.article.coverImageUrl,
      externalVideoLinks: this.getNormalizedVideoLinks(),
    };

    if (this.currentArticleId) {
      // Workaround: the production backend currently fails when article updates include externalVideoLinks.
      // We omit them on edits so status/content changes still succeed and existing links remain preserved.
      delete payload.externalVideoLinks;
    }

    return payload;
  }

  private async uploadSelectedMedia(articleId: number): Promise<{ uploadedMedia: UploadedImageResult[]; failedUploads: FailedUpload[] }> {
    if (!this.selectedMedia.length) {
      return { uploadedMedia: [], failedUploads: [] };
    }

    const uploadedMedia: UploadedImageResult[] = [];
    const failedUploads: FailedUpload[] = [];

    for (const [index, media] of this.selectedMedia.entries()) {
      this.progressMessage = `Enviando ${index + 1} de ${this.selectedMedia.length}: ${media.file.name}`;
      const formData = new FormData();
      formData.append('file', media.file);
      formData.append('type', 'IMAGE');
      formData.append('altText', media.altText.trim() || this.article.title.trim());
      formData.append('articleId', articleId.toString());

      try {
        const response: any = await firstValueFrom(this.http.post('/api/media/upload', formData));
        uploadedMedia.push({
          media,
          response: response.data,
        });
      } catch (error: any) {
        failedUploads.push({
          media,
          message: this.extractRequestError(error, `Falha ao enviar ${media.file.name}.`),
        });
      }
    }

    const coverCandidate = uploadedMedia.find((item) => item.media.isCover)?.response || null;

    if (coverCandidate?.url) {
      await firstValueFrom(this.http.put(`/api/articles/${articleId}`, { coverImageUrl: coverCandidate.url }));
    } else if (this.selectedExistingCoverUrl) {
      await firstValueFrom(this.http.put(`/api/articles/${articleId}`, { coverImageUrl: this.selectedExistingCoverUrl }));
    }

    return { uploadedMedia, failedUploads };
  }

  private ensureCoverSelection(): void {
    if (this.selectedExistingCoverUrl || this.selectedMedia.find((media) => media.isCover)) {
      return;
    }

    const firstImageIndex = this.selectedMedia.findIndex(() => true);
    if (firstImageIndex === -1) {
      return;
    }

    this.selectedMedia = this.selectedMedia.map((media, index) => ({
      ...media,
      isCover: index === firstImageIndex,
    }));
  }

  private buildDefaultAltText(position: number): string {
    const baseTitle = this.article.title.trim();
    return baseTitle ? `${baseTitle} - imagem ${position}` : `Imagem ${position}`;
  }

  private getNormalizedVideoLinks(): string[] {
    return this.externalVideoLinks
      .map((link) => this.normalizeExternalLink(link))
      .filter((link) => Boolean(link));
  }

  private normalizeExternalLink(value: string): string {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return '';
    }

    if (/^https?:\/\//i.test(trimmedValue)) {
      return trimmedValue;
    }

    return `https://${trimmedValue}`;
  }

  private isSupportedVideoLink(link: string): boolean {
    try {
      const parsedUrl = new URL(link);
      const host = parsedUrl.hostname.toLowerCase();

      return host === 'youtube.com'
        || host === 'www.youtube.com'
        || host === 'm.youtube.com'
        || host === 'youtu.be'
        || host === 'www.youtu.be'
        || host === 'instagram.com'
        || host === 'www.instagram.com';
    } catch {
      return false;
    }
  }

  private formatFileSize(size: number): string {
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  private revokeAllPreviews(): void {
    this.selectedMedia.forEach((media) => URL.revokeObjectURL(media.previewUrl));
  }

  private buildUploadWarning(articleId: number, failedUploads: FailedUpload[]): string {
    const failedNames = failedUploads
      .map((failure) => `${failure.media.file.name}: ${failure.message}`)
      .join(' | ');

    return `Artigo #${articleId} salvo, mas ${failedUploads.length} imagem(ns) falharam. Corrija e salve novamente para reenviar somente o que ficou pendente. ${failedNames}`;
  }

  private extractRequestError(error: any, fallback: string): string {
    if (typeof error?.error === 'string' && error.error.trim()) {
      return error.error;
    }

    return error?.error?.message || error?.message || fallback;
  }

  private clearMessages(): void {
    this.error = '';
    this.warningMessage = '';
    this.progressMessage = '';
  }

  private toLocalDateTimeInputValue(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, '0');

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
    ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}


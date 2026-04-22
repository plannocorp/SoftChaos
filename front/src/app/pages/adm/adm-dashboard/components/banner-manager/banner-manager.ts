import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BannerItem } from '../../../../../models/banner';
import { BannerService } from '../../../../../services/banner-service';

interface BannerFormModel {
  title: string;
  subtitle: string;
  buttonLabel: string;
  targetUrl: string;
  imageAltText: string;
  displayOrder: number;
  active: boolean;
}

@Component({
  selector: 'app-banner-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banner-manager.html',
  styleUrl: './banner-manager.css',
})
export class BannerManager implements OnInit, OnDestroy {
  readonly maxBanners = 5;

  banners: BannerItem[] = [];
  loading = true;
  saving = false;
  error = '';
  successMessage = '';
  editingBannerId: number | null = null;
  imagePreviewUrl = '';
  private previewObjectUrl: string | null = null;
  private selectedImageFile: File | null = null;

  form: BannerFormModel = this.createEmptyForm();

  constructor(private bannerService: BannerService) {}

  get isEditing(): boolean {
    return this.editingBannerId !== null;
  }

  get canCreateMoreBanners(): boolean {
    return this.isEditing || this.banners.length < this.maxBanners;
  }

  get orderOptions(): number[] {
    const limit = this.isEditing ? this.banners.length : Math.min(this.banners.length + 1, this.maxBanners);
    return Array.from({ length: Math.max(limit, 1) }, (_, index) => index + 1);
  }

  ngOnInit(): void {
    this.loadBanners();
  }

  ngOnDestroy(): void {
    this.revokePreviewObjectUrl();
  }

  loadBanners(): void {
    this.loading = true;
    this.error = '';

    this.bannerService.getAdminBanners().subscribe({
      next: (banners) => {
        this.banners = banners.slice(0, this.maxBanners);
        if (!this.isEditing) {
          this.form.displayOrder = Math.min(this.banners.length + 1, this.maxBanners) || 1;
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Nao foi possivel carregar os banners do painel.';
        this.loading = false;
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    this.selectedImageFile = file;
    this.revokePreviewObjectUrl();
    this.previewObjectUrl = URL.createObjectURL(file);
    this.imagePreviewUrl = this.previewObjectUrl;
    input.value = '';
  }

  editBanner(banner: BannerItem): void {
    this.clearMessages();
    this.editingBannerId = banner.id;
    this.form = {
      title: banner.title,
      subtitle: banner.subtitle || '',
      buttonLabel: banner.buttonLabel || '',
      targetUrl: banner.targetUrl || '',
      imageAltText: banner.imageAltText || '',
      displayOrder: banner.displayOrder,
      active: banner.active,
    };
    this.selectedImageFile = null;
    this.revokePreviewObjectUrl();
    this.imagePreviewUrl = banner.imageUrl;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  saveBanner(): void {
    this.clearMessages();

    if (!this.form.title.trim()) {
      this.error = 'Informe um titulo para o banner.';
      return;
    }

    if (!this.isEditing && !this.selectedImageFile) {
      this.error = 'Selecione uma imagem para cadastrar o banner.';
      return;
    }

    if (!this.canCreateMoreBanners) {
      this.error = 'O limite de 5 banners ja foi atingido.';
      return;
    }

    const payload = this.buildFormData();
    this.saving = true;

    const request$ = this.isEditing
      ? this.bannerService.updateBanner(this.editingBannerId as number, payload)
      : this.bannerService.createBanner(payload);

    request$.subscribe({
      next: () => {
        this.successMessage = this.isEditing
          ? 'Banner atualizado com sucesso.'
          : 'Banner criado com sucesso.';
        this.saving = false;
        this.resetForm();
        this.loadBanners();
      },
      error: (error) => {
        this.error = this.extractErrorMessage(error, 'Nao foi possivel salvar o banner.');
        this.saving = false;
      }
    });
  }

  deleteBanner(banner: BannerItem): void {
    this.clearMessages();

    if (!window.confirm(`Remover o banner "${banner.title}"?`)) {
      return;
    }

    this.bannerService.deleteBanner(banner.id).subscribe({
      next: () => {
        this.successMessage = 'Banner removido com sucesso.';
        if (this.editingBannerId === banner.id) {
          this.resetForm();
        }
        this.loadBanners();
      },
      error: (error) => {
        this.error = this.extractErrorMessage(error, 'Nao foi possivel remover o banner.');
      }
    });
  }

  private buildFormData(): FormData {
    const payload = new FormData();
    payload.append('title', this.form.title.trim());
    payload.append('subtitle', this.form.subtitle.trim());
    payload.append('buttonLabel', this.form.buttonLabel.trim());
    payload.append('targetUrl', this.form.targetUrl.trim());
    payload.append('imageAltText', this.form.imageAltText.trim());
    payload.append('displayOrder', String(this.form.displayOrder));
    payload.append('active', String(this.form.active));

    if (this.selectedImageFile) {
      payload.append('image', this.selectedImageFile);
    }

    return payload;
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.editingBannerId = null;
    this.selectedImageFile = null;
    this.imagePreviewUrl = '';
    this.revokePreviewObjectUrl();
  }

  private createEmptyForm(): BannerFormModel {
    return {
      title: '',
      subtitle: '',
      buttonLabel: '',
      targetUrl: '',
      imageAltText: '',
      displayOrder: Math.min(this.banners.length + 1, this.maxBanners) || 1,
      active: true,
    };
  }

  private revokePreviewObjectUrl(): void {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }
  }

  private clearMessages(): void {
    this.error = '';
    this.successMessage = '';
  }

  private extractErrorMessage(error: any, fallback: string): string {
    return error?.error?.message
      || error?.error?.error
      || fallback;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BannerItem } from '../../../models/banner';
import { BannerService } from '../../../services/banner-service';

@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-carousel.html',
  styleUrl: './banner-carousel.css',
})
export class BannerCarousel implements OnInit, OnDestroy {
  banners: BannerItem[] = [];
  currentIndex = 0;
  loading = true;
  error = '';
  private rotationTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private bannerService: BannerService) {}

  get currentBanner(): BannerItem | null {
    return this.banners[this.currentIndex] ?? null;
  }

  ngOnInit(): void {
    this.loadBanners();
  }

  ngOnDestroy(): void {
    this.stopAutoRotation();
  }

  loadBanners(): void {
    this.loading = true;
    this.error = '';

    this.bannerService.getPublicBanners().subscribe({
      next: (banners) => {
        this.banners = banners.slice(0, 5);
        this.currentIndex = 0;
        this.loading = false;
        this.restartAutoRotation();
      },
      error: () => {
        this.loading = false;
        this.error = 'Nao foi possivel carregar os banners da home.';
      }
    });
  }

  previousBanner(): void {
    if (!this.banners.length) {
      return;
    }

    this.currentIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length;
    this.restartAutoRotation();
  }

  nextBanner(): void {
    if (!this.banners.length) {
      return;
    }

    this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    this.restartAutoRotation();
  }

  goToBanner(index: number): void {
    this.currentIndex = index;
    this.restartAutoRotation();
  }

  private restartAutoRotation(): void {
    this.stopAutoRotation();

    if (this.banners.length <= 1) {
      return;
    }

    this.rotationTimer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    }, 10000);
  }

  private stopAutoRotation(): void {
    if (this.rotationTimer) {
      clearInterval(this.rotationTimer);
      this.rotationTimer = null;
    }
  }
}

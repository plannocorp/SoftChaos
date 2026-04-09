import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingIndicator } from '../loading-indicator/loading-indicator';

@Component({
  selector: 'app-progressive-image',
  standalone: true,
  imports: [CommonModule, LoadingIndicator],
  templateUrl: './progressive-image.html',
  styleUrl: './progressive-image.css',
})
export class ProgressiveImage implements OnChanges {
  @Input() src?: string;
  @Input() alt: string = '';
  @Input() fallback: string = 'https://placehold.co/1200x800?text=Soft+Chaos';

  currentSrc = this.fallback;
  loading = true;
  failed = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] || changes['fallback']) {
      this.currentSrc = this.src || this.fallback;
      this.loading = true;
      this.failed = false;
    }
  }

  onLoad(): void {
    this.loading = false;
  }

  onError(): void {
    if (this.currentSrc !== this.fallback) {
      this.currentSrc = this.fallback;
      return;
    }

    this.loading = false;
    this.failed = true;
  }
}

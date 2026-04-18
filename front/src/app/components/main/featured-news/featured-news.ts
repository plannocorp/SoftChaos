import { Component, OnInit } from '@angular/core';
import { News } from '../../../models/news';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../../services/public-article-service';
import { LoadingIndicator } from '../../shared/loading-indicator/loading-indicator';
import { ProgressiveImage } from '../../shared/progressive-image/progressive-image';

@Component({
  selector: 'app-featured-news',
  imports: [CommonModule, RouterLink, LoadingIndicator, ProgressiveImage],
  templateUrl: './featured-news-modern.html',
  styleUrl: './featured-news-modern.css',
})
export class FeaturedNews implements OnInit {
  public mainNews?: News;
  public firstSecondNews?: News;
  public secSecondNews?: News;
  public loading = true;
  public error = '';

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadFeaturedNews();
  }

  loadFeaturedNews(): void {
    this.loading = true;
    this.error = '';

    this.publicArticleService.getLatestArticles(3).subscribe({
      next: (articles) => {
        this.mainNews = articles[0];
        this.firstSecondNews = articles[1];
        this.secSecondNews = articles[2];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias em destaque:', err);
        this.error = 'Nao foi possivel carregar as noticias em destaque agora.';
        this.loading = false;
      }
    });
  }
}

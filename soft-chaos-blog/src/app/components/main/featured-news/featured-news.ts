import { Component, OnInit } from '@angular/core';
import { News } from '../../../models/news';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../../services/public-article-service';

@Component({
  selector: 'app-featured-news',
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-news.html',
  styleUrl: './featured-news.css',
})
export class FeaturedNews implements OnInit {
  public mainNews?: News;
  public firstSecondNews?: News;
  public secSecondNews?: News;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadFeaturedNews();
  }

  loadFeaturedNews(): void {
    this.publicArticleService.getLatestArticles(3).subscribe({
      next: (articles) => {
        this.mainNews = articles[0];
        this.firstSecondNews = articles[1];
        this.secSecondNews = articles[2];
      },
      error: (err) => {
        console.error('Erro ao carregar noticias em destaque:', err);
      }
    });
  }
}

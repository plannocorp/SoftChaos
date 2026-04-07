import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";
import { NewsService } from '../../../services/news-service';
import { ArticleResponse } from '../../../models/article-response';

@Component({
  selector: 'app-featured-news',
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-news.html',
  styleUrl: './featured-news.css',
})
export class FeaturedNews implements OnInit {
  public mainNews?: ArticleResponse;
  public firstSecondNews?: ArticleResponse;
  public secSecondNews?: ArticleResponse;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadFeaturedNews();
  }

  loadFeaturedNews(): void {
    this.newsService.getLatestNews().subscribe({
      next: (latest) => {
        this.mainNews = latest;
        console.log('Main News:', this.mainNews);
      },
      error: (err) => console.error('Erro ao carregar main news', err)
    });

    this.newsService.getSecondaryNews().subscribe({
      next: (secondary) => {
        this.firstSecondNews = secondary[0];
        this.secSecondNews = secondary[1];
        console.log('Secondary News:', secondary);
      },
      error: (err) => console.error('Erro ao carregar secondary news', err)
    });
  }
}

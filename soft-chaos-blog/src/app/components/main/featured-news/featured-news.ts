import { Component, OnInit } from '@angular/core';
import { News } from '../../../models/news';
import { NewsService } from '../../../services/news-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

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

  constructor(private newsService: NewsService) {} // Injeção de dependencia do Service

  ngOnInit(): void {
    this.loadFeaturedNews();
  }

  loadFeaturedNews(): void {
    this.mainNews = this.newsService.getLatestNews();

    const secondaryNews = this.newsService.getSecondaryNews();

    this.firstSecondNews = secondaryNews[0];
    this.secSecondNews = secondaryNews[1];

    // Log para Debug
    console.log('Main News:', this.mainNews);
    console.log('Secondary News:', secondaryNews)
  }
}

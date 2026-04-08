import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from "@angular/router";
import { NewsService } from '../../../services/news-service';
import { ArticleResponse } from '../../../models/article-response';
import { ArticleSummary } from '../../../models/article-summary';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-explorer',
  imports: [RouterLink, CommonModule],
  templateUrl: './explorer.html',
  styleUrl: './explorer.css',
})
export class Explorer implements OnInit {
  public firstCardNews?: ArticleResponse | ArticleSummary;
  public secCardNews?: ArticleResponse | ArticleSummary;
  public thirdCardNews?: ArticleResponse | ArticleSummary;

  constructor(
    private newsService: NewsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCardNews();
  }

  public loadCardNews(): void {
    forkJoin({
      all: this.newsService.getAll(),
      pinned: this.newsService.getPinnedArticles()
    }).subscribe({
      next: ({ all, pinned }) => {
        const sortedAll = [...all].sort((a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        const featuredNews = sortedAll.slice(0, 3);
        const cards: (ArticleResponse | ArticleSummary)[] = [];

        for (const pinnedArticle of pinned) {
          if (cards.length >= 3) break;
          cards.push(pinnedArticle);
        }

        const fallbackNews = sortedAll.filter(article =>
          !featuredNews.some(featured => featured.id === article.id) &&
          !cards.some(card => card.id === article.id)
        );

        for (const article of fallbackNews) {
          if (cards.length >= 3) break;
          cards.push(article);
        }

        this.firstCardNews = cards[0];
        this.secCardNews = cards[1];
        this.thirdCardNews = cards[2];

        console.log('Cards do Explorer:', cards);
        this.cd.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar explorador', err)
    });
  }
}

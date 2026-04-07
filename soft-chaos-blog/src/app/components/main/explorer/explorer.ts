import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { NewsService } from '../../../services/news-service';
import { ArticleResponse } from '../../../models/article-response';
import { ArticleSummary } from '../../../models/article-summary';
import { Observable, forkJoin, map } from 'rxjs';
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

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.loadCardNews();
  }

  public loadCardNews(): void {
    // Busca todos os artigos e os fixados em paralelo
    forkJoin({
      all: this.newsService.getAll(),
      pinned: this.newsService.getPinnedArticles()
    }).subscribe({
      next: ({ all, pinned }) => {
        // 1. Ordena todos por data decrescente (já deve vir ordenado, mas garantimos)
        const sortedAll = [...all].sort((a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );

        // 2. Os 3 primeiros são os usados no FeaturedNews
        const featuredNews = sortedAll.slice(0, 3);

        // 3. Artigos fixados que NÃO estão entre os 3 primeiros
        const pinnedNotInFeatured = pinned.filter(p =>
          !featuredNews.some(f => f.id === p.id)
        );

        // 4. Próximos artigos (não fixados e não featured) a partir do 4º
        const nextNews = sortedAll
          .filter(article =>
            !pinned.some(p => p.id === article.id) && // não é fixado
            !featuredNews.some(f => f.id === article.id) // não está no featured
          )
          .slice(0, 3); // no máximo 3

        // 5. Monta os 3 cards: primeiro os pinned (até 3), depois completa com nextNews
        const cards: (ArticleResponse | ArticleSummary)[] = [];

        // Adiciona pinned (respeitando ordem de data)
        for (let i = 0; i < pinnedNotInFeatured.length && cards.length < 3; i++) {
          cards.push(pinnedNotInFeatured[i]);
        }

        // Completa com os próximos
        for (let i = 0; i < nextNews.length && cards.length < 3; i++) {
          cards.push(nextNews[i]);
        }

        // Atribui aos campos
        this.firstCardNews = cards[0];
        this.secCardNews = cards[1];
        this.thirdCardNews = cards[2];

        console.log('Cards do Explorer:', cards);
      },
      error: (err) => console.error('Erro ao carregar explorador', err)
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { News } from '../../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../../services/public-article-service';
import { LoadingIndicator } from '../../shared/loading-indicator/loading-indicator';
import { ProgressiveImage } from '../../shared/progressive-image/progressive-image';

@Component({
  selector: 'app-explorer',
  imports: [RouterLink, LoadingIndicator, ProgressiveImage],
  templateUrl: './explorer.html',
  styleUrl: './explorer.css',
})
export class Explorer implements OnInit {
  public firstCardNews: News | undefined;
  public secCardNews: News | undefined;
  public thirdCardNews: News | undefined;
  public loading = true;
  public error = '';
  
  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit() {
    this.loadCardNews();
  }

  public loadCardNews(): void {
    this.loading = true;
    this.error = '';

    this.publicArticleService.getLatestArticles(6).subscribe({
      next: (articles) => {
        const cardNews = articles.length > 3 ? articles.slice(3, 6) : articles.slice(0, 3);
        this.firstCardNews = cardNews[0];
        this.secCardNews = cardNews[1];
        this.thirdCardNews = cardNews[2];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar cards de noticia:', err);
        this.error = 'Nao foi possivel carregar a exploracao agora.';
        this.loading = false;
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { News } from '../../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../../services/public-article-service';

@Component({
  selector: 'app-explorer',
  imports: [RouterLink],
  templateUrl: './explorer.html',
  styleUrl: './explorer.css',
})
export class Explorer implements OnInit {
  public firstCardNews: News | undefined;
  public secCardNews: News | undefined;
  public thirdCardNews: News | undefined;
  
  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit() {
    this.loadCardNews();
  }

  public loadCardNews(): void {
    this.publicArticleService.getLatestArticles(6).subscribe({
      next: (articles) => {
        const cardNews = articles.length > 3 ? articles.slice(3, 6) : articles.slice(0, 3);
        this.firstCardNews = cardNews[0];
        this.secCardNews = cardNews[1];
        this.thirdCardNews = cardNews[2];
      },
      error: (err) => {
        console.error('Erro ao carregar cards de noticia:', err);
      }
    });
  }
}

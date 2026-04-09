import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';
import { LoadingIndicator } from '../../components/shared/loading-indicator/loading-indicator';
import { ProgressiveImage } from '../../components/shared/progressive-image/progressive-image';

@Component({
  selector: 'app-opiniao',
  imports: [Header, Footer, RouterLink, LoadingIndicator, ProgressiveImage],
  templateUrl: './opiniao.html',
  styleUrl: './opiniao.css',
})
export class Opiniao implements OnInit {
  public newsOpiniao: News[] | undefined;
  public loading = true;
  public error = '';

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadOpiniaoNews();
  }

  public loadOpiniaoNews(): void {
    this.loading = true;
    this.error = '';

    this.publicArticleService.getArticlesByCategorySlug('opiniao').subscribe({
      next: (articles) => {
        this.newsOpiniao = articles;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias de opiniao:', err);
        this.newsOpiniao = [];
        this.error = 'Nao foi possivel carregar as noticias de opiniao agora.';
        this.loading = false;
      }
    });
  }
}

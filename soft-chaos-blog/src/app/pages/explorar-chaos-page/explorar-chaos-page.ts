import { Component, OnInit } from '@angular/core';
import { News } from '../../models/news';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';
import { LoadingIndicator } from '../../components/shared/loading-indicator/loading-indicator';
import { ProgressiveImage } from '../../components/shared/progressive-image/progressive-image';

@Component({
  selector: 'app-explorar-chaos-page',
  imports: [Header, Footer, RouterLink, LoadingIndicator, ProgressiveImage],
  templateUrl: './explorar-chaos-page.html',
  styleUrl: './explorar-chaos-page.css',
})
export class ExplorarChaosPage implements OnInit {
  public existentNews: News[] | undefined;
  public loading = true;
  public error = '';

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadAllNews();
  }

  public loadAllNews(): void {
    this.loading = true;
    this.error = '';

    this.publicArticleService.getPublishedArticles().subscribe({
      next: (articles) => {
        this.existentNews = articles;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias da exploracao:', err);
        this.existentNews = [];
        this.error = 'Nao foi possivel carregar as noticias publicadas agora.';
        this.loading = false;
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';
import { LoadingIndicator } from '../../components/shared/loading-indicator/loading-indicator';
import { ProgressiveImage } from '../../components/shared/progressive-image/progressive-image';

@Component({
  selector: 'app-novidades',
  imports: [Header, Footer, RouterLink, LoadingIndicator, ProgressiveImage],
  templateUrl: './novidades.html',
  styleUrl: './novidades.css',
})
export class Novidades implements OnInit {
  public newsNovidades: News[] | undefined;
  public loading = true;
  public error = '';

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadNovidadeNews();
  }

  loadNovidadeNews(): void {
    this.loading = true;
    this.error = '';

    this.publicArticleService.getArticlesByCategorySlug('novidades').subscribe({
      next: (articles) => {
        this.newsNovidades = articles;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias de novidades:', err);
        this.newsNovidades = [];
        this.error = 'Nao foi possivel carregar as noticias de novidades agora.';
        this.loading = false;
      }
    });
  }
}

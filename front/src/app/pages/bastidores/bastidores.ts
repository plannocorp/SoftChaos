import { Pagination } from '../../components/shared/pagination/pagination';
import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';
import { LoadingIndicator } from '../../components/shared/loading-indicator/loading-indicator';
import { ProgressiveImage } from '../../components/shared/progressive-image/progressive-image';

@Component({
  selector: 'app-bastidores',
  imports: [Header, Footer, RouterLink, LoadingIndicator, ProgressiveImage, Pagination],
  templateUrl: './bastidores.html',
  styleUrl: './bastidores.css',
})
export class Bastidores implements OnInit {
  public newsBastidores: News[] | undefined;
  public loading = true;
  public error = '';
  public page = 0;
  public totalPages = 0;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadBastidoresNews();
  }

  public loadBastidoresNews(page = 0): void {
    this.loading = true;
    this.error = '';

    this.publicArticleService.getArticlesByCategorySlug('bastidores', page).subscribe({
      next: (articles) => {
        this.newsBastidores = articles.content;
        this.page = articles.pageNumber;
        this.totalPages = articles.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias de bastidores:', err);
        this.newsBastidores = [];
        this.error = 'Nao foi possivel carregar as noticias de bastidores agora.';
        this.loading = false;
      }
    });
  }
}

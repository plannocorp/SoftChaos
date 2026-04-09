import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';

@Component({
  selector: 'app-tendencias',
  imports: [Header, Footer, RouterLink],
  templateUrl: './tendencias.html',
  styleUrl: './tendencias.css',
})
export class Tendencias implements OnInit {
  public newsTendencias: News[] | undefined;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadTendenciasNews();
  }

  public loadTendenciasNews(): void {
    this.publicArticleService.getArticlesByCategorySlug('tendencias').subscribe({
      next: (articles) => {
        this.newsTendencias = articles;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias de tendencias:', err);
        this.newsTendencias = [];
      }
    });
  }
}

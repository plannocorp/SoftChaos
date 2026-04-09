import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';

@Component({
  selector: 'app-novidades',
  imports: [Header, Footer, RouterLink],
  templateUrl: './novidades.html',
  styleUrl: './novidades.css',
})
export class Novidades implements OnInit {
  public newsNovidades: News[] | undefined;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadNovidadeNews();
  }

  loadNovidadeNews(): void {
    this.publicArticleService.getArticlesByCategorySlug('novidades').subscribe({
      next: (articles) => {
        this.newsNovidades = articles;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias de novidades:', err);
        this.newsNovidades = [];
      }
    });
  }
}

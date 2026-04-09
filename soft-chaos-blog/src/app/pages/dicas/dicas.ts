import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';

@Component({
  selector: 'app-dicas',
  imports: [Header, Footer, RouterLink],
  templateUrl: './dicas.html',
  styleUrl: './dicas.css',
})
export class Dicas implements OnInit {
  public newsDicas: News[] | undefined;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadDicasNews();
  }

  public loadDicasNews(): void {
    this.publicArticleService.getArticlesByCategorySlug('dicas').subscribe({
      next: (articles) => {
        this.newsDicas = articles;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias de dicas:', err);
        this.newsDicas = [];
      }
    });
  }
}

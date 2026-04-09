import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';

@Component({
  selector: 'app-opiniao',
  imports: [Header, Footer, RouterLink],
  templateUrl: './opiniao.html',
  styleUrl: './opiniao.css',
})
export class Opiniao implements OnInit {
  public newsOpiniao: News[] | undefined;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadOpiniaoNews();
  }

  public loadOpiniaoNews(): void {
    this.publicArticleService.getArticlesByCategorySlug('opiniao').subscribe({
      next: (articles) => {
        this.newsOpiniao = articles;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias de opiniao:', err);
        this.newsOpiniao = [];
      }
    });
  }
}

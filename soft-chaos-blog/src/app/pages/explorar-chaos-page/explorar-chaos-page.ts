import { Component, OnInit } from '@angular/core';
import { News } from '../../models/news';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';

@Component({
  selector: 'app-explorar-chaos-page',
  imports: [Header, Footer, RouterLink],
  templateUrl: './explorar-chaos-page.html',
  styleUrl: './explorar-chaos-page.css',
})
export class ExplorarChaosPage implements OnInit {
  public existentNews: News[] | undefined;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadAllNews();
  }

  public loadAllNews(): void {
    this.publicArticleService.getPublishedArticles().subscribe({
      next: (articles) => {
        this.existentNews = articles;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias da exploracao:', err);
        this.existentNews = [];
      }
    });
  }
}

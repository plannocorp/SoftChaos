import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { RouterLink } from "@angular/router";
import { PublicArticleService } from '../../services/public-article-service';

@Component({
  selector: 'app-bastidores',
  imports: [Header, Footer, RouterLink],
  templateUrl: './bastidores.html',
  styleUrl: './bastidores.css',
})
export class Bastidores implements OnInit {
  public newsBastidores: News[] | undefined;

  constructor(private publicArticleService: PublicArticleService) {}

  ngOnInit(): void {
    this.loadBastidoresNews();
  }

  public loadBastidoresNews(): void {
    this.publicArticleService.getArticlesByCategorySlug('bastidores').subscribe({
      next: (articles) => {
        this.newsBastidores = articles;
      },
      error: (err) => {
        console.error('Erro ao carregar noticias de bastidores:', err);
        this.newsBastidores = [];
      }
    });
  }
}

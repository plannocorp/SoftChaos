import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { News } from '../../models/news';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../services/news-service';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";

@Component({
  selector: 'app-news-page',
  imports: [CommonModule, Header, Footer],
  templateUrl: './news-page.html',
  styleUrl: './news-page.css',
})
export class NewsPage implements OnInit {
  public news?: News;
  public loading: boolean = true;
  public notFound: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  private loadNews(): void {
    // Pegar Slug da URL

    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    // Buscar a notícia pelo slug

    this.news = this.newsService.getBySlug(slug);

    // Verifica se encontrou

    if(!this.news) {
      this.notFound = true;
    }

    this.loading = false;

    console.log('Slug:', slug);
    console.log('Notícia encontrada:', this.news);
  }

  // Método para voltar a home

  public goBack(): void {
    this.router.navigate(['/']);
  }
}

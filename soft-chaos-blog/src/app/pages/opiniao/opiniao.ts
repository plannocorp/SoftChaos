import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { RouterLink } from "@angular/router";
import { NewsService } from '../../services/news-service';
import { ArticleSummary } from '../../models/article-summary';

@Component({
  selector: 'app-opiniao',
  imports: [Header, Footer, RouterLink],
  templateUrl: './opiniao.html',
  styleUrl: './opiniao.css',
})
export class Opiniao implements OnInit {
  public newsOpiniao: ArticleSummary[] = [];

  constructor(
    private newsService: NewsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBastidoresNews();
  }

  public loadBastidoresNews(): void {
    this.newsService.getAll().subscribe({
      next: (allArticles) => {
        this.newsOpiniao = allArticles.filter(
          article => article.categoryName?.toLowerCase() === 'bastidores'
        );
        console.log(`Bastidores: ${this.newsOpiniao.length} artigos encontrados`);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar notícias de Bastidores', err);
        this.newsOpiniao = [];
        this.cd.detectChanges();
      }
    });
  }
}

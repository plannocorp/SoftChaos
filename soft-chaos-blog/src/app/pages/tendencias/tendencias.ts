import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { NewsService } from '../../services/news-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-tendencias',
  imports: [Header, Footer, RouterLink],
  templateUrl: './tendencias.html',
  styleUrl: './tendencias.css',
})
export class Tendencias implements OnInit {
  public newsTendencias: News[] | undefined;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadTendenciasNews();
  }

  public loadTendenciasNews(): void {
    this.newsTendencias = this.newsService.getByType('TENDÊNCIAS')
  }
}

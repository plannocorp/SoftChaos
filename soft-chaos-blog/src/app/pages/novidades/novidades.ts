import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { NewsService } from '../../services/news-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-novidades',
  imports: [Header, Footer, RouterLink],
  templateUrl: './novidades.html',
  styleUrl: './novidades.css',
})
export class Novidades implements OnInit {
  public newsNovidades: News[] | undefined;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadNovidadeNews();
  }

  loadNovidadeNews(): void {
    this.newsNovidades = this.newsService.getByType('NOVIDADES');
  }
}

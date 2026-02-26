import { Component, OnInit } from '@angular/core';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { News } from '../../models/news';
import { NewsService } from '../../services/news-service';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-bastidores',
  imports: [Header, Footer, RouterLink],
  templateUrl: './bastidores.html',
  styleUrl: './bastidores.css',
})
export class Bastidores implements OnInit {
  public newsBastidores: News[] | undefined;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadBastidoresNews();
  }

  public loadBastidoresNews(): void {
    this.newsBastidores = this.newsService.getByType('BASTIDORES');
  }
}

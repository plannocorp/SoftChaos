import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { News } from '../../../../../models/news';
import { NewsService } from '../../../../../services/news-service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class Overview implements OnInit {
  recentArticles: News[] = [];
  stats = {
    totalArticles: 0,
    newToday: 0,
  };

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.recentArticles = this.newsService.getRecentNews(5);
    this.stats = this.newsService.getStats();
  }

  deleteArticle(id: number | undefined) {
    if (!id) return;
    // Por enquanto apenas remove da lista local até integrar com a API
    this.recentArticles = this.recentArticles.filter(a => a.id !== id);
  }
}
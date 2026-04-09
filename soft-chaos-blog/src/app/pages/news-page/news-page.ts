import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { News } from '../../models/news';
import { ActivatedRoute, Router } from '@angular/router';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";
import { PublicArticleService } from '../../services/public-article-service';

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
    private publicArticleService: PublicArticleService
  ) {}

  ngOnInit(): void {
    this.loadNews();
  }

  private loadNews(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.notFound = true;
      this.loading = false;
      return;
    }

    this.publicArticleService.getArticleBySlug(slug).subscribe({
      next: (news) => {
        this.news = news;
        this.notFound = false;
        this.loading = false;
      },
      error: () => {
        this.news = undefined;
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  public goBack(): void {
    this.router.navigate(['/']);
  }
}

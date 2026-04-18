import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header/header";
import { FeaturedNews } from "./components/main/featured-news/featured-news";
import { Explorer } from "./components/main/explorer/explorer";
import { Footer } from "./components/footer/footer/footer";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('soft-chaos-blog');

  constructor(private http: HttpClient) {}
  
  ngOnInit() {
    this.http.get('/api/categories').subscribe({
      next: data => console.log('✅ Proxy OK:', data),
      error: err => console.error('❌ Erro:', err)
    });
  }
}

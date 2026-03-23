import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { News } from '../../models/news';  // ← SEU MODEL
import { NewsService } from '../../services/news-service';
import { Header } from "../../components/header/header/header";
import { Footer } from "../../components/footer/footer/footer";  // ← SEU SERVIÇO

@Component({
  selector: 'app-search-pages',
  standalone: true,
  imports: [CommonModule, RouterLink, Header, Footer],
  templateUrl: './search-pages.html',
  styleUrl: './search-pages.css',
})
export class SearchPages implements OnInit {
  searchTerm: string = '';
  resultados: News[] = [];
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('PARAMS:', params);  // ← DEBUG
      this.searchTerm = params['q'] || '';
      console.log('SEARCH TERM:', this.searchTerm);  // ← DEBUG
      
      if (this.searchTerm.trim()) {
        this.buscarNoticias();
      } else {
        this.resultados = [];  // Limpa se busca vazia
      }
    });
  }

  private buscarNoticias(): void {
    this.loading = true;
  
    const todasNoticias = this.newsService.getAll();
  
    const termo = this.normalizeString(this.searchTerm.toLowerCase().trim());
  
    this.resultados = todasNoticias.filter(noticia => {
      const titleMatch = this.normalizeString(noticia.title.toLowerCase()).includes(termo);
      const descMatch = this.normalizeString(noticia.description.toLowerCase()).includes  (termo);
      const typeMatch = this.normalizeString(noticia.type.toLowerCase()).includes(termo);
    
      console.log(`❓ ${noticia.title}: title=${titleMatch}`);
    
      return titleMatch || descMatch || typeMatch;
    });
  
    console.log('✅ RESULTADOS:', this.resultados.length);
    this.loading = false;
  }

  private normalizeString(str: string): string {
    return str
      .normalize('NFD')           // Decompõe acentos (á → a + ´)
      .replace(/[\u0300-\u036f]/g, '')  // Remove os acentos
      .replace(/[^a-z0-9\s]/g, '');     // Remove caracteres especiais
  }
}

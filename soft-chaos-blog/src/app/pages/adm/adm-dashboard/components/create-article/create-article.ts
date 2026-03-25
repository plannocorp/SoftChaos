import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { News } from '../../../../../models/news';

@Component({
  selector: 'app-create-article',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-article.html',
  styleUrls: ['./create-article.css']
})
export class CreateArticle implements OnInit {
  article: News = {
    title: '',
    content: '',
    publishAt: new Date(),
    author: '',
    imageURL: '',
    slug: '',
    type: '',
    description: '',
    readTime: 0
  };
  
  previewImage: string | null = null;
  publishAtString: string = '';
  loading = false;
  error = '';
  minDate: string = new Date().toISOString().slice(0, 16);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Carrega data atual formatada
    this.publishAtString = new Date().toISOString().slice(0, 16);
  }

  onImageChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
        this.article.imageURL = file.name; // Nome do arquivo pro backend
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.previewImage = null;
    this.article.imageURL = '';
    const input = document.querySelector('input[name="image"]') as HTMLInputElement;
    input.value = '';
  }

  saveArticle() {
    if (!this.validateForm()) return;

    this.loading = true;
    this.error = '';

    // Converte string para Date
    this.article.publishAt = new Date(this.publishAtString);

    // POST para API
    this.http.post('/api/articles', this.article).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('✅ Artigo criado:', response);
        alert('Artigo publicado com sucesso!');
        // Limpa form ou redireciona
        this.resetForm();
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.error?.message || 'Erro ao salvar artigo';
        console.error('❌ Erro:', err);
      }
    });
  }

  validateForm(): boolean {
    if (!this.article.title.trim()) {
      this.error = 'Título é obrigatório';
      return false;
    }
    if (!this.article.type) {
      this.error = 'Tipo é obrigatório';
      return false;
    }
    if (!this.article.content.trim()) {
      this.error = 'Conteúdo é obrigatório';
      return false;
    }
    return true;
  }

  resetForm() {
    this.article = {
      title: '',
      content: '',
      publishAt: new Date(),
      author: '',
      imageURL: '',
      slug: '',
      type: '',
      description: '',
      readTime: 0
    };
    this.previewImage = null;
    this.publishAtString = new Date().toISOString().slice(0, 16);
    this.error = '';
  }
}

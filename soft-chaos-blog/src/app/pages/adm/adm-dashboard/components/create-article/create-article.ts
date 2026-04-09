import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../../services/auth';
import { firstValueFrom } from 'rxjs';
import { CreateArticleRequest } from '../../../../../models/news';
import { NewsService } from '../../../../../services/news-service';
import { Category } from '../../../../../models/category';

@Component({
  selector: 'app-create-article',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-article.html',
  styleUrls: ['./create-article.css']
})
export class CreateArticle implements OnInit {
  article: CreateArticleRequest = {
    title: '',
    summary: '',
    content: '',
    categoryId: null!,  // ← Sem default
    status: 'DRAFT',
    tagIds: [],
    featured: false,
    pinned: false
  };

  previewImage: string | null = null;
  imageFile: File | null = null;
  publishAtString: string = '';
  loading = false;
  loadingCategories = false;
  error = '';
  minDate: string = new Date().toISOString().slice(0, 16);

  categories: Category[] = [];  // ← Carrega da API

  constructor(
    private http: HttpClient,
    private newsService: NewsService,  // ← SEU SERVICE
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private router: Router
  ) { }

  async ngOnInit() {
    this.publishAtString = new Date().toISOString().slice(0, 16);
    await this.loadCategories();
  }

  async loadCategories() {
    this.loadingCategories = true;
    try {
      const categories = await firstValueFrom(this.newsService.getCategories());
      this.categories = categories || [];

      // 🔧 FORCE REFRESH SELECT
      setTimeout(() => {
        this.article.categoryId = null;  // Reset pra forçar update
      }, 100);

      console.log('✅ Categorias:', this.categories);
    } catch (err) {
      console.error('❌ Erro:', err);
      this.error = 'Erro ao carregar categorias';
    } finally {
      this.loadingCategories = false;
      this.cd.detectChanges();
    }
  }


  onImageChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => this.previewImage = e.target.result;
      reader.readAsDataURL(file);
    }
  }

  clearImage() {
    this.previewImage = null;
    this.imageFile = null;
    const input = document.querySelector('input[name="image"]') as HTMLInputElement;
    input.value = '';
  }

  async saveArticle() {
    if (!this.validateForm()) return;

    this.loading = true;
    this.error = '';

    try {
      const scheduledFor = this.article.status === 'SCHEDULED'
        ? this.publishAtString
        : undefined;

      // POST /api/articles (SEM imagem)
      const articlePayload: CreateArticleRequest = { // Pega tudo do form
        ...this.article,
        summary: this.article.summary || this.article.title.substring(0, 150), // Auto summary
        scheduledFor
      };

      console.log('📤 POST /api/articles:', articlePayload);

      // ✅ firstValueFrom SUBSTITUI toPromise
      const articleRes: any = await firstValueFrom(this.http.post('/api/articles', articlePayload));
      const articleId = articleRes.data.id;
      console.log('✅ Artigo criado ID:', articleId);

      // UPLOAD IMAGEM (SE HÁ) + articleId
      if (this.imageFile) {
        const formData = new FormData();
        formData.append('file', this.imageFile!);
        formData.append('type', 'IMAGE');
        formData.append('altText', this.article.title);
        formData.append('articleId', articleId.toString()); // ← ASSOCIA DIRETO!

        console.log('📤 POST /api/media/upload com articleId:', articleId);
        const mediaRes: any = await firstValueFrom(this.http.post('/api/media/upload', formData));
        const coverImageUrl = mediaRes.data?.url;

        if (coverImageUrl) {
          await firstValueFrom(this.http.put(`/api/articles/${articleId}`, { coverImageUrl }));
        }
        console.log('✅ Imagem upload + associada!');
      }

      this.loading = false;
      alert('✅ Artigo criado com sucesso!');
      this.router.navigate(['/security/adimin-dashboard/overview']);

    } catch (err: any) {
      this.loading = false;
      this.error = err.error?.message || 'Erro ao criar artigo';
      console.error('❌ Erro:', err);
    }
  }

  validateForm(): boolean {
    if (!this.article.title.trim()) {
      this.error = 'Título obrigatório'; return false;
    }
    if (!this.article.categoryId) {
      this.error = 'Categoria obrigatória'; return false;
    }
    if (this.article.status === 'SCHEDULED' && !this.publishAtString) {
      this.error = 'Data de publicacao obrigatoria'; return false;
    }
    if (!this.article.content.trim()) {
      this.error = 'Conteúdo obrigatório'; return false;
    }
    return true;
  }

  resetForm() {
    this.article = {
      title: '',
      summary: '',
      content: '',
      categoryId: 1,
      status: 'DRAFT',
      tagIds: [],
      featured: false,
      pinned: false
    };
    this.previewImage = null;
    this.imageFile = null;
    this.publishAtString = new Date().toISOString().slice(0, 16);
    this.error = '';
  }
}

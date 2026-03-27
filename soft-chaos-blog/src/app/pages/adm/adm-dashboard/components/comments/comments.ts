import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Comment {
  id: number;
  articleTitle: string;
  articleSlug: string;
  author: string;
  email: string;
  content: string;
  createdAt: Date;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './comments.html',
  styleUrls: ['./comments.css']
})
export class Comments implements OnInit {
  allComments: Comment[] = [];
  filteredComments: Comment[] = [];
  searchTerm = '';
  statusFilter = '';

  error = '';

  constructor() {}

  ngOnInit() {
    this.loadComments();
  }

  loadComments() {
    // Mock data - substitua por CommentService + API
    this.allComments = [
      {
        id: 1,
        articleTitle: 'Título da Notícia',
        articleSlug: 'titulo-da-noticia',
        author: 'João Silva',
        email: 'joao@email.com',
        content: 'Excelente artigo! Muito conteúdo útil e bem explicado.',
        createdAt: new Date('2026-03-24'),
        status: 'APROVADO'
      },
      {
        id: 2,
        articleTitle: 'Título da Primeira Notícia Secundária',
        articleSlug: 'titulo-da-primeira-noticia-secundaria',
        author: 'Maria Oliveira',
        email: 'maria@email.com',
        content: 'Gostaria de mais detalhes sobre este tópico.',
        createdAt: new Date('2026-03-24'),
        status: 'PENDENTE'
      },
      {
        id: 3,
        articleTitle: 'Título da notícia do card do Explorer 1',
        articleSlug: 'titulo-da-noticia-do-explorer-1',
        author: 'Pedro Santos',
        email: 'pedro@email.com',
        content: 'Conteúdo irrelevante e spam.',
        createdAt: new Date('2026-03-23'),
        status: 'REJEITADO'
      },

      {
        id: 4,
        articleTitle: 'Título da notícia do card do Explorer 1',
        articleSlug: 'titulo-da-noticia-do-explorer-1',
        author: 'Pedro Santos',
        email: 'pedro@email.com',
        content: 'Conteúdo irrelevante e spam.',
        createdAt: new Date('2026-03-23'),
        status: 'REJEITADO'
      }
    ];
    this.filteredComments = [...this.allComments];
  }

  filterComments() {
    let filtered = [...this.allComments];

    if (this.searchTerm.trim()) {
      filtered = filtered.filter(comment =>
        comment.author.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        comment.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        comment.articleTitle.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(comment => comment.status === this.statusFilter);
    }

    this.filteredComments = filtered;
  }

  approveComment(id: number) {
    const comment = this.allComments.find(c => c.id === id);
    if (comment) {
      comment.status = 'APROVADO';
      this.filterComments();
      // Chame API: PUT /api/comments/{id}/approve
    }
  }

  rejectComment(id: number) {
    const comment = this.allComments.find(c => c.id === id);
    if (comment) {
      comment.status = 'REJEITADO';
      this.filterComments();
      // Chame API: PUT /api/comments/{id}/reject
    }
  }

  deleteComment(id: number) {
    if (confirm('Tem certeza que deseja excluir este comentário?')) {
      this.allComments = this.allComments.filter(c => c.id !== id);
      this.filterComments();
      // Chame API: DELETE /api/comments/{id}
    }
  }
}

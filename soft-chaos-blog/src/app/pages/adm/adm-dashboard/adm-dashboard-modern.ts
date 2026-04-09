import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-adm-dashboard-modern',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './adm-dashboard-modern.html',
  styleUrl: './adm-dashboard-modern.css',
})
export class AdmDashboardModern implements OnInit {
  userName = '';
  userRole = '';
  userInitials = 'SC';
  mobileMenuOpen = false;
  navigationItems = [
    {
      label: 'Overview',
      description: 'Panorama geral',
      route: '/security/adimin-dashboard/overview',
    },
    {
      label: 'Publicar',
      description: 'Nova materia',
      route: '/security/adimin-dashboard/create-article',
    },
    {
      label: 'Rascunhos',
      description: 'Materias em edicao',
      route: '/security/adimin-dashboard/drafts',
    },
    {
      label: 'Agendados',
      description: 'Fila programada',
      route: '/security/adimin-dashboard/scheduled',
    },
    {
      label: 'Publicados',
      description: 'Conteudo no ar',
      route: '/security/adimin-dashboard/published',
    },
    {
      label: 'Comentarios',
      description: 'Todos os status',
      route: '/security/adimin-dashboard/comments',
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const auth = localStorage.getItem('auth');
    if (!auth) {
      return;
    }

    const user = JSON.parse(auth);
    this.userName = user.name || 'Equipe SoftChaos';
    this.userRole = user.role || 'ADMIN';
    this.userInitials = this.userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join('') || 'SC';
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/security/adimin-auth']);
  }
}

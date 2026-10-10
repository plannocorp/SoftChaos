import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth';

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
      label: 'Visão geral',
      description: 'Panorama geral',
      route: '/security/adimin-dashboard/overview',
    },
    {
      label: 'Publicar',
      description: 'Nova matéria',
      route: '/security/adimin-dashboard/create-article',
    },
    {
      label: 'Rascunhos',
      description: 'Matérias em edição',
      route: '/security/adimin-dashboard/drafts',
    },
    {
      label: 'Agendados',
      description: 'Fila programada',
      route: '/security/adimin-dashboard/scheduled',
    },
    {
      label: 'Publicados',
      description: 'Conteúdo no ar',
      route: '/security/adimin-dashboard/published',
    },
    {
      label: 'Comentários',
      description: 'Todos os status',
      route: '/security/adimin-dashboard/comments',
    },
    {
      label: 'Banners',
      description: 'Carrossel da página inicial',
      route: '/security/adimin-dashboard/banners',
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const user = this.authService.getUserData();
    if (!user) {
      return;
    }

    this.userName = user.name || 'Equipe SoftChaos';
    this.userRole = user.role || 'Administradora';
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
    this.authService.logout();
    this.router.navigate(['/security/adimin-auth']);
  }
}

import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-adm-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, RouterOutlet],
  templateUrl: './adm-dashboard.html',
  styleUrl: './adm-dashboard.css',
})
export class AdmDashboard implements OnInit {
  userName = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    const auth = localStorage.getItem('auth');
    if (auth) this.userName = JSON.parse(auth).name;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/security/adimin-auth']);
  }
}

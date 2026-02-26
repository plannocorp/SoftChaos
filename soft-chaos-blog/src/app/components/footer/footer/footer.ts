import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer {
  currentYear: number = new Date().getFullYear();
  
  // Método para assinar a newsletter
  subscribeNewsletter(email: string): void {
    // Aqui você implementaria a lógica para processar a assinatura
    console.log('Email para newsletter:', email);
    // Você poderia adicionar uma chamada de API aqui
  }
}
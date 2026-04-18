import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-indicator.html',
  styleUrl: './loading-indicator.css',
})
export class LoadingIndicator {
  @Input() label: string = 'Carregando...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() centered: boolean = true;
  @Input() surface: 'plain' | 'soft' = 'plain';
}

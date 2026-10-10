import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    @if (totalPages > 1) {
      <nav aria-label="Paginação de notícias">
        <button type="button" [disabled]="loading || page === 0" (click)="pageChange.emit(page - 1)">Anterior</button>
        <span aria-live="polite">Página {{ page + 1 }} de {{ totalPages }}</span>
        <button type="button" [disabled]="loading || page + 1 >= totalPages" (click)="pageChange.emit(page + 1)">Próxima</button>
      </nav>
    }
  `,
  styles: [`nav { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:16px; padding:28px 16px; }
    button { border:1px solid var(--darkgray); border-radius:12px; background:white; padding:12px 20px; cursor:pointer; font:inherit; }
    button:disabled { opacity:.45; cursor:default; }`],
})
export class Pagination {
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() loading = false;
  @Output() pageChange = new EventEmitter<number>();
}

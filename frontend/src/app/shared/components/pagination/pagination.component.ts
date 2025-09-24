import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';

// Asume que esta constante se define en un archivo de configuración
export const ITEM_PER_PAGE = 10;

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent implements OnInit {
  @Input() page: number = 1;
  @Input() count: number = 0;

  hasPrev: boolean = false;
  hasNext: boolean = false;
  totalPages: number = 0;
  pages: number[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.calculatePagination();
  }

  // Se usa ngOnChanges para recalcular la paginación si las propiedades de entrada cambian
  ngOnChanges(): void {
    this.calculatePagination();
  }

  calculatePagination(): void {
    // Convierte las entradas a números para evitar errores de tipo
    const currentPage = Number(this.page);
    const totalCount = Number(this.count);

    this.hasPrev = ITEM_PER_PAGE * (currentPage - 1) > 0;
    this.hasNext = ITEM_PER_PAGE * currentPage < totalCount;

    this.totalPages = Math.ceil(totalCount / ITEM_PER_PAGE);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(newPage: number): void {
    // Navega a la nueva URL con los parámetros actualizados
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: newPage },
      queryParamsHandling: 'merge'
    });
  }
}
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { catchError, EMPTY, Subject, switchMap, takeUntil } from 'rxjs';
import { ClientesService } from '../../../services/cliente.service';

/**
 * Interface para los botones de navegación rápida
 */
interface NavButton {
  label: string;
  icon: string;
  target: string;
}

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    RouterModule,
  ],
  templateUrl: './listado.component.html'
})
export class ListadoComponent implements OnInit, OnDestroy {
  // --- Dependencias e Inyecciones ---
  private readonly route = inject(ActivatedRoute);
  private readonly clientesSvc = inject(ClientesService);
  private readonly destroy$ = new Subject<void>();

  // Signal para la pestaña activa en la interfaz
  // readonly pestania = signal<(typeof this.tabs)[number]>('cliente');

  // Metadatos para los botones de iconos del panel lateral
  readonly quickNavButtons: NavButton[] = [
    { label: 'Cliente', icon: 'bi-person-fill', target: 'cliente' },
    { label: 'Contactos', icon: 'bi-telephone-fill', target: 'contactos' },
    { label: 'Colegio', icon: 'bi-book-fill', target: 'colegio' },
    { label: 'Sanitario', icon: 'bi-heart-pulse-fill', target: 'sanitario' },
    { label: 'Terapeutas', icon: 'bi-person', target: 'terapeutas' },
    { label: 'Objetivos', icon: 'bi-bullseye', target: 'objetivos' },
    { label: 'Registro', icon: 'bi-journal-text', target: 'registro' }, 
  ];

  // --- Estado de la UI ---
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  // --- Signals del Servicio ---
  readonly cliente = this.clientesSvc.cliente;
  readonly contactos = this.clientesSvc.contactos;
  readonly colegio = this.clientesSvc.colegio;
  readonly sanitario = this.clientesSvc.sanitario;

  ngOnInit(): void {
    this.getDetalleCliente();
  }

  /**
   * Gestiona la suscripción reactiva para obtener los detalles del cliente
   */
  getDetalleCliente(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');

          if (!id) {
            this.handleError('ID de cliente no proporcionado en la URL.');
            return EMPTY;
          }

          this.prepareLoad();

          return this.clientesSvc.loadAll(id).pipe(
            catchError((err) => {
              this.handleError(
                'Error al cargar los datos completos del cliente',
              );
              console.error('Error fetching client:', err);
              return EMPTY;
            }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => this.finalizeLoad(),
        error: () => this.isLoading.set(false),
      });
  }

  // --- Métodos de apoyo para el estado ---

  private prepareLoad(): void {
    this.isLoading.set(true);
    this.error.set(null);
  }

  private finalizeLoad(): void {
    this.isLoading.set(false);
    console.log('Carga de datos de cliente completa y Signals actualizados.');
  }

  private handleError(message: string): void {
    this.error.set(message);
    this.isLoading.set(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Limpieza de estado al salir (si el método existe en el servicio)
    if (this.clientesSvc.clearCliente) {
      this.clientesSvc.clearCliente();
    }
  }
}

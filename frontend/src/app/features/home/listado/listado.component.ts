/* listado.component.ts */
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { catchError, EMPTY, Subject, switchMap, takeUntil } from 'rxjs';
import { ClientesService } from '../../../services/cliente.service';

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
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss'],
})
// IMPORTANTE: Implementar OnInit y OnDestroy para el ciclo de vida
export class ListadoComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  readonly tabs = [
    'cliente',
    'contactos',
    'colegio',
    'sanitario',
    'demanda',
    'tratamientos',
  ] as const;
  pestania = signal<(typeof this.tabs)[number]>('cliente');

  isLoading = signal(true);
  error = signal<string | null>(null);

  // Destructor para limpiar Observables
  private destroy$ = new Subject<void>();

  private clientesSvc = inject(ClientesService);
  cliente = this.clientesSvc.cliente; // ← señal compartida
  contactos = this.clientesSvc.contactos;
  colegio = this.clientesSvc.colegio;
  sanitario = this.clientesSvc.sanitario;

  // CORRECCIÓN CLAVE: Iniciar la suscripción del router aquí
  ngOnInit(): void {
    this.getDetalleCliente();
  }

  // Se ha eliminado el método getDetalleCliente, ya que su lógica se movió a ngOnInit
  getDetalleCliente() {
    this.route.paramMap
      .pipe(
        // 1. Ahora, 'params' se recibe correctamente del paramMap
        // y lo usamos para obtener el ID de la URL.
        switchMap((params) => {
          const id = params.get('id'); // <-- ¡CORREGIDO! Usamos el ID de la URL

          if (!id) {
            this.error.set('ID de cliente no proporcionado en la URL.');
            return EMPTY;
          }
          this.isLoading.set(true);
          this.error.set(null);

          // 2. Usamos el método loadAll() del servicio (que es el encargado de
          // hacer múltiples llamadas y setear los Signals).
          return this.clientesSvc.loadAll(id).pipe(
            catchError((err) => {
              this.error.set('Error al cargar los datos completos del cliente');
              console.error('Error fetching client:', err);
              return EMPTY;
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        // 3. El 'next' ahora espera 'void', ya que los datos ya fueron seteados
        // en los Signals dentro del servicio (con los 'tap' de loadAll).
        next: () => {
          this.isLoading.set(false);
          console.log(
            'Carga de datos de cliente completa y Signals actualizados.'
          );
        },
        // El error ya se maneja en el catchError, pero mantenemos el error handler
        // en el subscribe para cualquier error que pudiera escapar.
        error: () => {
          this.isLoading.set(false);
        },
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Limpia el estado al salir de la vista (opcional, pero buena práctica)
    this.clientesSvc.clearCliente();
  }
}

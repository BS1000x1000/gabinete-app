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

  private clientesService = inject(ClientesService);

  // CORRECCIÓN CLAVE: Iniciar la suscripción del router aquí
  ngOnInit(): void {
    this.getDetalleCliente();
  }

  // Se ha eliminado el método getDetalleCliente, ya que su lógica se movió a ngOnInit
  getDetalleCliente() {
    this.route.paramMap
      .pipe(
        // switchMap se ejecuta CADA VEZ que el parámetro 'id' cambie
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.error.set('ID de cliente no proporcionado en la URL.');
            return EMPTY;
          }
          this.isLoading.set(true);
          this.error.set(null);
          // Llamar al servicio API para obtener el cliente
          return this.clientesService.getClienteById(id).pipe(
            catchError((err) => {
              this.error.set('Error al cargar los datos del cliente');
              console.error('Error fetching client:', err);
              return EMPTY;
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (clienteData: any) => {
          // 5. Guardar los datos en el servicio de estado compartido
          this.clientesService.setCliente(clienteData);
          this.isLoading.set(false);
          console.log(clienteData);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Limpia el estado al salir de la vista (opcional, pero buena práctica)
    this.clientesService.clearCliente();
  }
}

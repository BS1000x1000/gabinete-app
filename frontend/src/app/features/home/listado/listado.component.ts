import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
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
import { ClienteDrawerComponent } from '../../../shared/components/cliente-drawer/cliente-drawer.component';
import { DrawerService } from '../../../services/drawer.service';

interface WorkTab {
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
    ClienteDrawerComponent,
  ],
  templateUrl: './listado.component.html',
})
export class ListadoComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly clientesSvc = inject(ClientesService);
  private readonly destroy$ = new Subject<void>();
  readonly drawerSvc = inject(DrawerService);

  @ViewChild(ClienteDrawerComponent) drawer!: ClienteDrawerComponent;

  // ID del cliente actual (para pasarlo al drawer)
  clienteId = signal<string>('');

  // Solo 3 tabs de trabajo activo en el right panel
  readonly workTabs: WorkTab[] = [
    { label: 'Seguimiento', icon: 'bi-journal-text', target: 'registro' },
    { label: 'Sesiones', icon: 'bi-calendar2-week', target: 'sesiones' },
    { label: 'Objetivos', icon: 'bi-bullseye', target: 'objetivos' },
    { label: 'Informes', icon: 'bi-file-earmark-text', target: 'informes' },
  ];

  // Estado de secciones colapsables del aside
  readonly seccionesAbiertas = signal<Record<string, boolean>>({
    personal: true, // abierto por defecto
    sanitario: false,
    contactos: false,
    colegio: false,
    terapeutas: false,
  });

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  // ClienteData (frontend) — nombre, apellidos, edad, domicilio, fechas...
  readonly cliente = this.clientesSvc.cliente;
  // ClienteDataBackend completo — activo, curso, trabajadoresAsignados...
  readonly clienteRaw = this.clientesSvc.clienteRaw;
  // Array de familiares del backend (iterable)
  readonly familiares = this.clientesSvc.contactosFamiliares;
  readonly colegio = this.clientesSvc.colegio;
  readonly sanitario = this.clientesSvc.sanitario;

  ngOnInit(): void {
    this.getDetalleCliente();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSeccion(seccion: string): void {
    this.seccionesAbiertas.update((prev) => ({
      ...prev,
      [seccion]: !prev[seccion],
    }));
  }

  isOpen(seccion: string): boolean {
    return this.seccionesAbiertas()[seccion] ?? false;
  }

  getDetalleCliente(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.handleError('ID de cliente no proporcionado en la URL.');
            return EMPTY;
          }
          this.clienteId.set(id);
          this.isLoading.set(true);
          this.error.set(null);
          return this.clientesSvc.loadAll(id).pipe(
            catchError((err) => {
              this.handleError(err?.message || 'Error al cargar el cliente.');
              return EMPTY;
            }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.isLoading.set(false);
      });
  }

  openDrawer(
    section: 'personal' | 'sanitario' | 'contactos' | 'colegio',
  ): void {
    this.drawerSvc.open(section, this.clienteId());
    // Prellenar el formulario en el siguiente tick, una vez el drawer está montado
    setTimeout(() => this.drawer?.onDrawerOpened(section), 0);
  }

  private handleError(msg: string): void {
    this.error.set(msg);
    this.isLoading.set(false);
  }
}

export default ListadoComponent;

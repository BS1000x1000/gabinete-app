import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, EMPTY, Subject, switchMap, takeUntil } from 'rxjs';
import { ClientesService } from '../../../services/cliente.service';
import { AuthService } from '../../../services/auth.service';

interface WorkTab {
  label: string;
  icon: string;
  target: string;
}

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './listado.component.html',
})
export class ListadoComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly clientesSvc = inject(ClientesService);
  private readonly auth = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  readonly clienteId = signal<string>('');

  /**
   * Pestañas del día a día: lo que se consulta o se rellena en cada sesión.
   * La configuración del caso (contratos, terapeutas) va aparte — ver `configTabs`.
   */
  readonly workTabs = computed<WorkTab[]>(() => {
    const tabs: WorkTab[] = [
      { label: 'Perfil',   icon: 'bi-person-vcard',   target: 'perfil'   },
      { label: 'Sesiones', icon: 'bi-calendar2-week', target: 'sesiones' },
    ];
    // RECEP no accede al contenido clínico
    if (!this.auth.isRecep()) {
      tabs.push({ label: 'Seguimiento', icon: 'bi-graph-up', target: 'progreso' });
    }
    tabs.push({ label: 'Documentación', icon: 'bi-folder2', target: 'documentacion' });
    return tabs;
  });

  /**
   * Configuración del caso: se toca al dar de alta y de tarde en tarde, no a diario.
   * Va en un grupo aparte para que no compita visualmente con lo de arriba.
   */
  readonly configTabs = computed<WorkTab[]>(() => {
    const tabs: WorkTab[] = [
      { label: 'Terapeutas', icon: 'bi-people', target: 'terapeutas' },
    ];
    if (!this.auth.isRecep()) {
      tabs.push({ label: 'Contratos', icon: 'bi-file-earmark-ruled', target: 'contratos' });
    }
    return tabs;
  });

  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly cliente = this.clientesSvc.cliente;
  readonly clienteRaw = this.clientesSvc.clienteRaw;
  readonly sanitario = this.clientesSvc.sanitario;

  readonly fullName = computed(() => {
    const c = this.cliente();
    if (!c) return '';
    return c.apellidos ? `${c.apellidos}, ${c.nombre}` : c.nombre;
  });

  readonly initials = computed(() => {
    const c = this.cliente();
    if (!c) return '';
    return `${c.nombre?.charAt(0) ?? ''}${c.apellidos?.charAt(0) ?? ''}`;
  });

  ngOnInit(): void {
    this.getDetalleCliente();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private handleError(msg: string): void {
    this.error.set(msg);
    this.isLoading.set(false);
  }
}

export default ListadoComponent;

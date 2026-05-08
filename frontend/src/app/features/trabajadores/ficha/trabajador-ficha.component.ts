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
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { catchError, EMPTY, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { TrabajadorService, Trabajador } from '../../../services/trabajadores.service';
import { DashboardService } from '../../../services/dashboard.service';
import { AuthService } from '../../../services/auth.service';

interface WorkTab {
  label: string;
  icon: string;
  target: string;
}

interface Kpis {
  clientesActivos: number;
  sesionesEsteMes: number;
  tasaCompletadas: number;
}

@Component({
  selector: 'app-trabajador-ficha',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './trabajador-ficha.component.html',
})
export class TrabajadorFichaComponent implements OnInit, OnDestroy {
  private readonly route         = inject(ActivatedRoute);
  private readonly router        = inject(Router);
  private readonly trabajadorSvc = inject(TrabajadorService);
  private readonly dashboardSvc  = inject(DashboardService);
  readonly auth = inject(AuthService);
  private readonly destroy$   = new Subject<void>();

  readonly trabajadorId = signal<string>('');
  readonly trabajador   = signal<Trabajador | null>(null);
  readonly kpis         = signal<Kpis | null>(null);
  readonly isLoading    = signal(true);
  readonly error        = signal<string | null>(null);

  readonly fullName = computed(() => {
    const t = this.trabajador();
    if (!t) return '';
    return `${t.nombre} ${t.apellidos}`;
  });

  readonly initials = computed(() => {
    const t = this.trabajador();
    if (!t) return '';
    return `${t.nombre?.charAt(0) ?? ''}${t.apellidos?.charAt(0) ?? ''}`.toUpperCase();
  });

  readonly rolClass = computed(() => this.getRolColor(this.trabajador()?.rol?.codigo));

  readonly tabs = computed<WorkTab[]>(() => {
    const tabs: WorkTab[] = [
      { label: 'Perfil',    icon: 'bi-person-badge',  target: 'perfil'   },
      { label: 'Clientes',  icon: 'bi-people',         target: 'clientes' },
      { label: 'Horario',   icon: 'bi-arrow-repeat',   target: 'horario'  },
    ];
    if (this.auth.isAdmin()) {
      tabs.push({ label: 'Acceso', icon: 'bi-shield-lock', target: 'acceso' });
    }
    return tabs;
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.error.set('ID de trabajador no encontrado en la URL.');
            this.isLoading.set(false);
            return EMPTY;
          }

          // Terapeutas solo pueden ver su propio perfil
          const esPropio = this.auth.currentTrabajadorId() === id;
          if (!this.auth.canVerTodo() && !esPropio) {
            const propioId = this.auth.currentTrabajadorId();
            this.router.navigate(propioId ? ['/home/trabajadores', propioId] : ['/home/agenda']);
            return EMPTY;
          }

          this.trabajadorId.set(id);
          this.isLoading.set(true);
          this.error.set(null);

          const now   = new Date();
          const desde = new Date(now.getFullYear(), now.getMonth(), 1);
          const hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

          return forkJoin({
            trabajador: this.trabajadorSvc.getTrabajador(id),
            stats:      this.dashboardSvc.getEstadisticasAvanzadas(desde, hasta, id).pipe(
              catchError(() => of(null)), // stats failure is non-critical
            ),
          }).pipe(
            catchError((err) => {
              this.error.set(err?.error?.message || 'Error al cargar el perfil.');
              this.isLoading.set(false);
              return EMPTY;
            }),
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe(({ trabajador, stats }) => {
        const t = trabajador.data;
        this.trabajador.set(t);
        this.trabajadorSvc.currentTrabajador.set(t);
        if (stats) {
          this.kpis.set({
            clientesActivos: stats.resumen?.clientesActivos  ?? 0,
            sesionesEsteMes: stats.resumen?.totalSesiones    ?? 0,
            tasaCompletadas: stats.resumen?.totalSesiones > 0
              ? Math.round((stats.resumen.sesionesCompletadas / stats.resumen.totalSesiones) * 100)
              : 0,
          });
        }
        this.isLoading.set(false);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getRolColor(codigo: string | undefined): string {
    const map: Record<string, string> = {
      ADMIN:              'rol-admin',
      TERAPEUTA:          'rol-terapeuta',
      LOGOPEDA:           'rol-logopeda',
      NEUROPSICOLOGIA:    'rol-neuro',
      TERAPIA_OCUPACIONAL:'rol-to',
      PEDAGOGIA:          'rol-pedagogia',
      RECEPCION:          'rol-recepcion',
    };
    return map[codigo?.toUpperCase() ?? ''] ?? 'rol-default';
  }
}

export default TrabajadorFichaComponent;

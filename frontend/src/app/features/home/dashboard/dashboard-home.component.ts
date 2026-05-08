import { Component, inject, computed, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { abrirEnlaceExterno } from '../../../shared/utils/url.utils';
import { DashboardService } from '../../../services/dashboard.service';
import { SesionesService } from '../../../services/sesiones.service';
import { EstadoSesion, TipoSesion, TIPO_SESION_LABELS } from '../../../interface/sesion.interface';
import {
  AlertaDashboard,
  InformeBorrador,
  BonoSinCobrar,
  ObjetivoSinEvaluar,
  SesionDashboard,
} from '../../../interface/dashboard.interface';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [NgClass],
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private sesionesSvc = inject(SesionesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  procesandoId = signal<string | null>(null);
  cancelandoId = signal<string | null>(null);

  miDia = this.dashboardService.miDia;
  isLoading = this.dashboardService.isLoading;

  fechaFormateada = computed(() => {
    const fecha = this.miDia()?.fecha;
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  });

  hayAlertas = computed(() => (this.miDia()?.alertasUrgentes?.length ?? 0) > 0);

  hayPendientes = computed(() => {
    const acc = this.miDia()?.accionesPendientes;
    if (!acc) return false;
    return (
      acc.informesEnBorrador.length +
        acc.bonosSinCobrar.length +
        acc.objetivosSinEvaluar.length >
      0
    );
  });

  totalPendientes = computed(() => {
    const acc = this.miDia()?.accionesPendientes;
    if (!acc) return 0;
    return (
      acc.informesEnBorrador.length +
      acc.bonosSinCobrar.length +
      acc.objetivosSinEvaluar.length
    );
  });

  canceladasTotal = computed(() => {
    const s = this.miDia()?.resumenMes?.sesiones?.porEstado;
    if (!s) return 0;
    return (s.canceladasConAviso ?? 0) + (s.canceladasSinAviso ?? 0);
  });

  sesionStates = computed(() => {
    const estados = new Map<string, { esActual: boolean; esProxima: boolean; esProgramada: boolean }>();
    const now = Date.now();
    this.miDia()?.sesionesHoy.forEach(s => {
      const inicio = new Date(s.horaInicio).getTime();
      const fin = new Date(s.horaFin).getTime();
      const diffMin = (inicio - now) / 60000;
      estados.set(s.id, {
        esActual:      s.estado === EstadoSesion.PROGRAMADA && inicio <= now && now <= fin,
        esProxima:     s.estado === EstadoSesion.PROGRAMADA && diffMin > 0 && diffMin <= 15,
        esProgramada:  s.estado === EstadoSesion.PROGRAMADA,
      });
    });
    return estados;
  });

  ngOnInit() {
    this.dashboardService.getMiDia()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  formatHora(iso: string): string {
    return new Date(iso).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  estadoClass(estado: string): string {
    return 'estado-' + estado.toLowerCase().replace(/_/g, '-');
  }

  tipoLabel(tipo: string): string {
    return TIPO_SESION_LABELS[tipo as keyof typeof TIPO_SESION_LABELS] ?? tipo;
  }

  tipoClass(tipo: TipoSesion): string {
    const map: Record<TipoSesion, string> = {
      [TipoSesion.PEDAGOGIA]:          'tipo-pedagogia',
      [TipoSesion.NEUROPSICOLOGIA]:    'tipo-neuro',
      [TipoSesion.LOGOPEDIA]:          'tipo-logopedia',
      [TipoSesion.TERAPIA_OCUPACIONAL]:'tipo-to',
      [TipoSesion.EVALUACION]:         'tipo-evaluacion',
      [TipoSesion.REUNION_COLEGIO]:    'tipo-reunion',
    };
    return map[tipo] ?? '';
  }

  bonoClass(bono: { sesionesConsumidas: number; totalSesiones: number }): string {
    const pct = bono.sesionesConsumidas / bono.totalSesiones;
    if (pct < 0.5) return 'bono-ok';
    if (pct < 0.75) return 'bono-warning';
    return 'bono-danger';
  }

  irAlCliente(clienteId: string) {
    this.router.navigate(['/home/listado', clienteId]);
  }

  navegarAlerta(alerta: AlertaDashboard) {
    if (alerta.accionUrl) this.router.navigateByUrl(alerta.accionUrl);
  }

  irAlInforme(informe: InformeBorrador) {
    this.router.navigate(['/home/listado', informe.cliente.id, 'informes']);
  }

  irAlBono(bono: BonoSinCobrar) {
    this.router.navigate(['/home/listado', bono.cliente.id, 'bonos']);
  }

  irAlObjetivo(obj: ObjetivoSinEvaluar) {
    this.router.navigate(['/home/listado', obj.cliente.id, 'objetivos']);
  }

  completar(sesion: SesionDashboard, $event: Event) {
    $event.stopPropagation();
    this.procesandoId.set(sesion.id);
    this.sesionesSvc.completarSesion(sesion.id, {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.procesandoId.set(null);
          this.dashboardService.getMiDia()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        },
        error: () => this.procesandoId.set(null),
      });
  }

  iniciarCancelar(sesion: SesionDashboard, $event: Event) {
    $event.stopPropagation();
    this.cancelandoId.set(sesion.id);
  }

  confirmarCancelar(sesion: SesionDashboard, conAviso: boolean, $event: Event) {
    $event.stopPropagation();
    this.cancelandoId.set(null);
    this.procesandoId.set(sesion.id);
    this.sesionesSvc.cancelarSesion(sesion.id, conAviso)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.procesandoId.set(null);
          this.dashboardService.getMiDia()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        },
        error: () => this.procesandoId.set(null),
      });
  }

  cancelarCancelacion($event: Event) {
    $event.stopPropagation();
    this.cancelandoId.set(null);
  }

  readonly abrirVideollamada = abrirEnlaceExterno;
}

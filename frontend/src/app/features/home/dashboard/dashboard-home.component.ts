import { Component, inject, computed, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import {
  AlertaDashboard,
  InformeBorrador,
  BonoSinCobrar,
  ObjetivoSinEvaluar,
} from '../../../interface/dashboard.interface';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [NgClass],
  templateUrl: './dashboard-home.component.html',
})
export class DashboardHomeComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

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

  ngOnInit() {
    this.dashboardService.getMiDia().subscribe();
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
    const labels: Record<string, string> = {
      PEDAGOGIA: 'Pedagogía',
      NEUROPSICOLOGIA: 'Neuropsicología',
      EVALUACION: 'Evaluación',
      REUNION_COLEGIO: 'Reunión colegio',
    };
    return labels[tipo] ?? tipo;
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
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ContratosService } from '../../../../services/contratos.service';
import { ContratoServicio } from '../../../../interface/contrato.interface';
import { TipoSesion, TIPO_SESION_LABELS } from '../../../../interface/sesion.interface';

const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const TIPO_COLOR: Record<string, string> = {
  PEDAGOGIA:           '#7c6fd6',
  NEUROPSICOLOGIA:     '#3b82f6',
  LOGOPEDIA:           '#10b981',
  TERAPIA_OCUPACIONAL: '#f59e0b',
  EVALUACION:          '#8b5cf6',
  REUNION_COLEGIO:     '#6b7280',
};

const ESTADO_LABEL: Record<string, string> = {
  ACTIVO:     'Activo',
  BORRADOR:   'Borrador',
  SUSPENDIDO: 'Suspendido',
  FINALIZADO: 'Finalizado',
};

@Component({
  selector: 'app-mis-contratos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-contratos.component.html',
})
export default class MisContratosComponent implements OnInit {
  private contratosService = inject(ContratosService);

  cargando = signal(false);
  error    = signal<string | null>(null);
  contratos = signal<ContratoServicio[]>([]);
  mostrarHistorial = signal(false);

  readonly activos = computed(() =>
    this.contratos().filter(c => c.estado === 'ACTIVO' || c.estado === 'BORRADOR'),
  );
  readonly historico = computed(() =>
    this.contratos().filter(c => c.estado === 'FINALIZADO' || c.estado === 'SUSPENDIDO'),
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.contratosService.getContratos()
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next:  data => this.contratos.set(data),
        error: ()   => this.error.set('Error al cargar los contratos.'),
      });
  }

  diaLabel(n: number): string    { return DIAS[n] ?? ''; }
  tipoLabel(t: string): string   { return TIPO_SESION_LABELS[t as TipoSesion] ?? t; }
  tipoColor(t: string): string   { return TIPO_COLOR[t] ?? '#6b7280'; }
  tipoBg(t: string): string      { return (TIPO_COLOR[t] ?? '#6b7280') + '18'; }
  estadoLabel(e: string): string { return ESTADO_LABEL[e] ?? e; }
}

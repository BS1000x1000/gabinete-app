import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ContratosService } from '../../../../services/contratos.service';
import { ContratoServicio, DIAS, TIPO_COLOR, ESTADO_CONTRATO_LABEL } from '../../../../interface/contrato.interface';
import { TipoSesion, TIPO_SESION_LABELS } from '../../../../interface/sesion.interface';

@Component({
  selector: 'app-mis-contratos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-contratos.component.html',
})
export default class MisContratosComponent implements OnInit {
  private contratosService = inject(ContratosService);

  cargando       = signal(false);
  error          = signal<string | null>(null);
  contratos      = signal<ContratoServicio[]>([]);
  mostrarHistorial = signal(false);
  descargandoId  = signal<string | null>(null);

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

  descargarPdf(id: string): void {
    this.descargandoId.set(id);
    this.contratosService.descargarPdf(id)
      .pipe(finalize(() => this.descargandoId.set(null)))
      .subscribe({ error: () => this.error.set('Error al generar el PDF del contrato') });
  }

  diaLabel(n: number): string    { return DIAS[n] ?? ''; }
  tipoLabel(t: string): string   { return TIPO_SESION_LABELS[t as TipoSesion] ?? t; }
  tipoColor(t: string): string   { return TIPO_COLOR[t] ?? '#6b7280'; }
  tipoBg(t: string): string      { return (TIPO_COLOR[t] ?? '#6b7280') + '18'; }
  estadoLabel(e: string): string { return ESTADO_CONTRATO_LABEL[e as keyof typeof ESTADO_CONTRATO_LABEL] ?? e; }
}

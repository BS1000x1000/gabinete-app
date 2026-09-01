import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { FacturasService } from '../../../../services/facturas.service';
import { ContratosService } from '../../../../services/contratos.service';
import {
  EstadoFactura,
  Factura,
  ESTADO_FACTURA_LABEL,
  PreviewGeneracion,
  ResultadoGeneracion,
} from '../../../../interface/factura.interface';
import { ContratoServicio } from '../../../../interface/contrato.interface';
import {
  OPCIONES_MES,
  esComputable,
  estaCobrada,
  periodo,
  periodoLabel,
  ultimosAnios,
} from '../../../../shared/utils/facturacion.utils';
import {
  EstadoCargaComponent,
  EstadoErrorComponent,
  EstadoVacioComponent,
} from '../../../../shared/components/estado-vista/estado-vista.component';

interface TrabajadorResumen {
  id: string;
  nombre: string;
  contratosActivos: number;
  facturadoMes: number;
  cobradoMes: number;
  pendienteMes: number;
  facturadoAnio: number;
  facturas: Factura[];
}

@Component({
  selector: 'app-supervision',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EstadoCargaComponent,
    EstadoErrorComponent,
    EstadoVacioComponent,
  ],
  templateUrl: './supervision.component.html',
})
export default class SupervisionComponent implements OnInit {
  private facturasService  = inject(FacturasService);
  private contratosService = inject(ContratosService);

  cargando    = signal(false);
  error       = signal<string | null>(null);
  expandidoId = signal<string | null>(null);

  // ── Generación de un periodo ─────────────────────────────────────────────
  /**
   * Antes esto era un botón que emitía el mes en curso de todo el gabinete sin
   * enseñar nada antes ni contar nada después. Ahora se elige el mes, se ve qué
   * se va a emitir y se ve qué salió y qué no.
   */
  modalGenerar = signal(false);
  genAnio = signal(new Date().getFullYear());
  genMes = signal(new Date().getMonth() + 1);
  genPreview = signal<PreviewGeneracion | null>(null);
  genResultado = signal<ResultadoGeneracion | null>(null);
  genCargando = signal(false);
  genError = signal<string | null>(null);

  readonly meses = OPCIONES_MES;
  readonly anios = ultimosAnios();

  readonly anioActual = new Date().getFullYear();
  readonly mesActual  = new Date().getMonth() + 1;
  readonly periodoMes = periodo(this.anioActual, this.mesActual);

  facturasAnio = signal<Factura[]>([]);
  contratos    = signal<ContratoServicio[]>([]);

  readonly resumen = computed<TrabajadorResumen[]>(() => {
    const facturas  = this.facturasAnio();
    const contratos = this.contratos();

    const trabajadoresMap: Record<string, { nombre: string }> = {};
    for (const f of facturas) {
      if (!trabajadoresMap[f.trabajadorId]) {
        trabajadoresMap[f.trabajadorId] = {
          nombre: `${f.trabajador.nombre} ${f.trabajador.apellidos}`,
        };
      }
    }
    for (const c of contratos) {
      if (!trabajadoresMap[c.trabajadorId]) {
        trabajadoresMap[c.trabajadorId] = {
          nombre: `${c.trabajador.nombre} ${c.trabajador.apellidos}`,
        };
      }
    }

    return Object.entries(trabajadoresMap)
      .map(([id, info]) => {
        const misFact    = facturas.filter(f => f.trabajadorId === id);
        const misActivos = contratos.filter(c => c.trabajadorId === id && c.estado === 'ACTIVO').length;

        let facturadoMes = 0, cobradoMes = 0, facturadoAnio = 0;
        for (const f of misFact) {
          if (!esComputable(f)) continue;
          facturadoAnio += +f.total;
          if (f.periodoFacturado === this.periodoMes) {
            facturadoMes += +f.total;
            if (estaCobrada(f)) cobradoMes += +f.total;
          }
        }

        return {
          id,
          nombre:           info.nombre,
          contratosActivos: misActivos,
          facturadoMes,
          cobradoMes,
          pendienteMes:     facturadoMes - cobradoMes,
          facturadoAnio,
          facturas:         misFact,
        };
      })
      .sort((a, b) => b.facturadoAnio - a.facturadoAnio);
  });

  readonly totales = computed(() => {
    let facturadoMes = 0, cobradoMes = 0, pendienteMes = 0, facturadoAnio = 0;
    for (const t of this.resumen()) {
      facturadoMes  += t.facturadoMes;
      cobradoMes    += t.cobradoMes;
      pendienteMes  += t.pendienteMes;
      facturadoAnio += t.facturadoAnio;
    }
    return { facturadoMes, cobradoMes, pendienteMes, facturadoAnio };
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin([
      this.facturasService.getFacturas({ anio: this.anioActual }),
      this.contratosService.getContratos(),
    ])
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ([facturas, contratos]) => {
          this.facturasAnio.set(facturas);
          this.contratos.set(contratos);
        },
        error: () => this.error.set('Error al cargar los datos de supervisión.'),
      });
  }

  toggleExpand(id: string): void {
    this.expandidoId.update(v => (v === id ? null : id));
  }

  abrirGenerar(): void {
    this.modalGenerar.set(true);
    this.genPreview.set(null);
    this.genResultado.set(null);
    this.genError.set(null);
    this.previsualizarGeneracion();
  }

  cerrarGenerar(): void {
    this.modalGenerar.set(false);
    if (this.genResultado()) this.cargar();
  }

  previsualizarGeneracion(): void {
    this.genCargando.set(true);
    this.genError.set(null);
    this.genResultado.set(null);
    // `soloMias: false` — desde Supervisión se mira todo el gabinete.
    this.facturasService
      .previsualizarGeneracion(this.genAnio(), this.genMes(), false)
      .pipe(finalize(() => this.genCargando.set(false)))
      .subscribe({
        next: (p) => this.genPreview.set(p),
        error: (err: any) => {
          this.genPreview.set(null);
          this.genError.set(err?.error?.message ?? 'No se pudo consultar el periodo.');
        },
      });
  }

  confirmarGeneracion(): void {
    this.genCargando.set(true);
    this.genError.set(null);
    this.facturasService
      .generarMes(this.genAnio(), this.genMes(), false)
      .pipe(finalize(() => this.genCargando.set(false)))
      .subscribe({
        next: (r) => {
          this.genResultado.set(r);
          this.genPreview.set(null);
        },
        error: (err: any) =>
          this.genError.set(err?.error?.message ?? 'No se pudieron generar las facturas.'),
      });
  }

  readonly periodoLabel = periodoLabel;

  estadoLabel(e: EstadoFactura): string { return ESTADO_FACTURA_LABEL[e] ?? e; }

  initiales(nombre: string): string {
    return nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
}

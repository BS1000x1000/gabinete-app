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
import { TareasService } from '../../../../services/tareas.service';
import {
  ESTADO_VISTA_BADGE,
  ESTADO_VISTA_LABEL,
  EstadoVista,
  ResumenTareaProgramada,
  TAREA_LABEL,
  estadoVista,
} from '../../../../interface/tarea.interface';
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

/** Una tarea programada tal y como se pinta en la tabla. */
interface FilaTarea {
  tarea: string;
  nombre: string;
  estado: EstadoVista;
  estadoLabel: string;
  badge: string;
  /** Estados que piden mirar: ausencia, fallo o proceso muerto por el camino. */
  alerta: boolean;
  inicio: string | null;
  /** La tarea corrió y decidió no hacer nada (julio no se factura, p. ej.). */
  omitida: boolean;
  motivo: string | null;
  resumen: { clave: string; valor: string }[];
  error: string | null;
}

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
  private tareasService    = inject(TareasService);

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

  // ── Tareas programadas ───────────────────────────────────────────────────
  /**
   * Se carga aparte del `forkJoin` principal a propósito: que falle el panel de
   * tareas no debe dejar en blanco la pantalla de facturación, ni al revés.
   */
  tareas         = signal<ResumenTareaProgramada[]>([]);
  tareasCargando = signal(false);
  tareasError    = signal<string | null>(null);

  readonly filasTareas = computed<FilaTarea[]>(() =>
    this.tareas().map(t => {
      const estado = estadoVista(t);
      const bruto = t.ultima?.resumen ?? null;
      return {
        tarea:       t.tarea,
        nombre:      TAREA_LABEL[t.tarea] ?? t.tarea,
        estado,
        estadoLabel: ESTADO_VISTA_LABEL[estado],
        badge:       ESTADO_VISTA_BADGE[estado],
        alerta:      estado === 'NUNCA' || estado === 'ERROR' || estado === 'INTERRUMPIDA',
        inicio:      t.ultima?.inicio ?? null,
        omitida:     bruto?.['omitida'] === true,
        motivo:      typeof bruto?.['motivo'] === 'string' ? bruto['motivo'] : null,
        resumen:     this.entradasResumen(bruto, ['omitida', 'motivo']),
        error:       t.ultima?.error ?? null,
      };
    }),
  );

  readonly tareasConProblema = computed(
    () => this.filasTareas().filter(f => f.alerta).length,
  );

  cargarTareas(): void {
    this.tareasCargando.set(true);
    this.tareasError.set(null);
    this.tareasService.getResumen()
      .pipe(finalize(() => this.tareasCargando.set(false)))
      .subscribe({
        next:  tareas => this.tareas.set(tareas),
        error: () => this.tareasError.set('No se pudo leer el estado de las tareas programadas.'),
      });
  }

  /**
   * Aplana el resumen libre de la tarea en pares legibles.
   *
   * `excluir` deja fuera las claves que ya tienen su propio hueco en la fila, para
   * no pintarlas dos veces.
   */
  private entradasResumen(
    resumen: Record<string, unknown> | null,
    excluir: string[] = [],
  ): { clave: string; valor: string }[] {
    if (!resumen) return [];
    return Object.entries(resumen)
      .filter(([clave]) => !excluir.includes(clave))
      .map(([clave, valor]) => ({
        clave,
        valor: Array.isArray(valor) ? String(valor.length) : String(valor),
      }));
  }

  /**
   * "hace 3 h". Es lo que hace saltar a la vista que un cron dejó de dispararse:
   * una fecha absoluta obliga a calcularlo mentalmente.
   */
  hace(iso: string): string {
    const minutos = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
    if (minutos < 1)  return 'hace un momento';
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.round(minutos / 60);
    if (horas < 48)   return `hace ${horas} h`;
    return `hace ${Math.round(horas / 24)} días`;
  }

  ngOnInit(): void {
    this.cargar();
    this.cargarTareas();
  }

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

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, forkJoin } from 'rxjs';
import { FacturasService } from '../../../../services/facturas.service';
import { ContratosService } from '../../../../services/contratos.service';
import { EstadoFactura, Factura, ESTADO_FACTURA_LABEL } from '../../../../interface/factura.interface';
import { ContratoServicio } from '../../../../interface/contrato.interface';

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

const MESES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

@Component({
  selector: 'app-supervision',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supervision.component.html',
})
export default class SupervisionComponent implements OnInit {
  private facturasService  = inject(FacturasService);
  private contratosService = inject(ContratosService);

  cargando    = signal(false);
  error       = signal<string | null>(null);
  generando   = signal(false);
  generadoMsg = signal<string | null>(null);
  expandidoId = signal<string | null>(null);

  readonly anioActual = new Date().getFullYear();
  readonly mesActual  = new Date().getMonth() + 1;
  readonly periodoMes = `${this.anioActual}-${String(this.mesActual).padStart(2, '0')}`;

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
          if (f.estado === 'ANULADA') continue;
          facturadoAnio += +f.total;
          if (f.periodoFacturado === this.periodoMes) {
            facturadoMes += +f.total;
            if (f.estado === 'PAGADA') cobradoMes += +f.total;
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

  generarMes(): void {
    this.generando.set(true);
    this.generadoMsg.set(null);
    this.facturasService.generarMes(this.anioActual, this.mesActual)
      .pipe(finalize(() => this.generando.set(false)))
      .subscribe({
        next: ({ creadas }) => {
          const s = creadas !== 1;
          this.generadoMsg.set(`${creadas} factura${s ? 's' : ''} generada${s ? 's' : ''}.`);
          this.cargar();
        },
        error: () => this.generadoMsg.set('Error al generar facturas.'),
      });
  }

  periodoLabel(p: string): string {
    const [y, m] = p.split('-');
    return `${MESES[+m] ?? m} ${y}`;
  }

  estadoLabel(e: EstadoFactura): string { return ESTADO_FACTURA_LABEL[e] ?? e; }

  initiales(nombre: string): string {
    return nombre.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FacturasService } from '../../../../services/facturas.service';
import { Factura, MarcarPagadaPayload } from '../../../../interface/factura.interface';

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
  selector: 'app-mis-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-facturas.component.html',
})
export default class MisFacturasComponent implements OnInit {
  private facturasService = inject(FacturasService);

  cargando = signal(false);
  error    = signal<string | null>(null);
  facturas = signal<Factura[]>([]);

  readonly anioActual = new Date().getFullYear();
  readonly mesActual  = new Date().getMonth() + 1;

  filtroAnio   = signal(this.anioActual);
  filtroMes    = signal<number | null>(null);
  filtroEstado = signal('');

  readonly anios = Array.from({ length: 4 }, (_, i) => this.anioActual - i);
  readonly meses = MESES.slice(1).map((label, i) => ({ value: i + 1, label }));

  // ── KPIs ─────────────────────────────────────────────────────────────────
  private readonly periodoMesActual =
    `${this.anioActual}-${String(this.mesActual).padStart(2, '0')}`;

  readonly kpiFacturadoMes = computed(() =>
    this.facturas()
      .filter(f => f.periodoFacturado === this.periodoMesActual && f.estado !== 'ANULADA')
      .reduce((s, f) => s + +f.total, 0),
  );

  readonly kpiCobradoMes = computed(() =>
    this.facturas()
      .filter(f => f.periodoFacturado === this.periodoMesActual && f.estado === 'PAGADA')
      .reduce((s, f) => s + +f.total, 0),
  );

  readonly kpiPendienteCobro = computed(() =>
    this.facturas()
      .filter(f => f.estado === 'PENDIENTE')
      .reduce((s, f) => s + +f.total, 0),
  );

  readonly kpiFacturadoAnio = computed(() =>
    this.facturas()
      .filter(f => f.estado !== 'ANULADA')
      .reduce((s, f) => s + +f.total, 0),
  );

  // ── Table (filtered) ─────────────────────────────────────────────────────
  readonly facturasFiltradas = computed(() => {
    const estado = this.filtroEstado();
    if (!estado) return this.facturas();
    return this.facturas().filter(f => f.estado === estado);
  });

  // ── Modal marcar pagada ───────────────────────────────────────────────────
  modalPagadaId   = signal<string | null>(null);
  fechaPago       = signal('');
  metodoPago      = signal('');
  guardandoPagada = signal(false);
  errorPagada     = signal<string | null>(null);

  // ── Anular confirm ────────────────────────────────────────────────────────
  confirmAnularId = signal<string | null>(null);
  anulando        = signal(false);

  // ── Per-row loading ───────────────────────────────────────────────────────
  descargandoId = signal<string | null>(null);
  reenviandoId  = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.facturasService.getFacturas({
      anio: this.filtroAnio(),
      mes:  this.filtroMes() ?? undefined,
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next:  data => this.facturas.set(data),
        error: ()   => this.error.set('Error al cargar las facturas.'),
      });
  }

  onFiltroChange(): void { this.cargar(); }

  // ── Acciones ──────────────────────────────────────────────────────────────
  abrirModalPagada(id: string): void {
    this.modalPagadaId.set(id);
    this.fechaPago.set(new Date().toISOString().slice(0, 10));
    this.metodoPago.set('');
    this.errorPagada.set(null);
  }

  cerrarModalPagada(): void {
    this.modalPagadaId.set(null);
  }

  confirmarPagada(): void {
    const id = this.modalPagadaId();
    if (!id || !this.fechaPago()) return;
    const payload: MarcarPagadaPayload = {
      fechaPago:  this.fechaPago(),
      ...(this.metodoPago() && { metodoPago: this.metodoPago() }),
    };
    this.guardandoPagada.set(true);
    this.errorPagada.set(null);
    this.facturasService.marcarPagada(id, payload)
      .pipe(finalize(() => this.guardandoPagada.set(false)))
      .subscribe({
        next:  updated => {
          this.facturas.update(list => list.map(f => f.id === updated.id ? updated : f));
          this.cerrarModalPagada();
        },
        error: (err: any) =>
          this.errorPagada.set(err?.error?.message ?? 'Error al marcar como pagada.'),
      });
  }

  solicitarAnular(id: string): void  { this.confirmAnularId.set(id); }
  cancelarAnular():  void            { this.confirmAnularId.set(null); }

  confirmarAnular(id: string): void {
    this.anulando.set(true);
    this.facturasService.anular(id)
      .pipe(finalize(() => { this.anulando.set(false); this.confirmAnularId.set(null); }))
      .subscribe({
        next: updated =>
          this.facturas.update(list => list.map(f => f.id === updated.id ? updated : f)),
      });
  }

  descargarPdf(id: string): void {
    this.descargandoId.set(id);
    this.facturasService.descargarPdf(id)
      .pipe(finalize(() => this.descargandoId.set(null)))
      .subscribe({ error: () => this.error.set('Error al generar el PDF de la factura.') });
  }

  reenviarEmail(id: string): void {
    this.reenviandoId.set(id);
    this.facturasService.reenviarEmail(id)
      .pipe(finalize(() => this.reenviandoId.set(null)))
      .subscribe({ next: () => this.cargar() });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  periodoLabel(p: string): string {
    const [y, m] = p.split('-');
    return `${MESES[+m] ?? m} ${y}`;
  }
}

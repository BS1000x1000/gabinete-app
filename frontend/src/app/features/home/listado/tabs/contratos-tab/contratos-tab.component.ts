import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ContratosService } from '../../../../../services/contratos.service';
import { TrabajadorService } from '../../../../../services/trabajadores.service';
import { AuthService } from '../../../../../services/auth.service';
import { ContratoServicio, CreateContratoPayload, SlotPayload, ModalidadSlot, DIAS, TIPO_COLOR, ESTADO_CONTRATO_LABEL } from '../../../../../interface/contrato.interface';
import { TipoSesion, TIPO_SESION_LABELS } from '../../../../../interface/sesion.interface';

interface SlotForm {
  diaSemana:       number | '';
  horaInicio:      string;
  horaFin:         string;
  duracionMinutos: number | null;
  modalidad:       ModalidadSlot;
}

interface NuevoContratoForm {
  tipoSesion:   TipoSesion | '';
  trabajadorId: string;
  cuotaMensual: number | null;
  fechaInicio:  string;
  notas:        string;
  slots:        SlotForm[];
}

function emptySlot(): SlotForm {
  return { diaSemana: '', horaInicio: '', horaFin: '', duracionMinutos: null, modalidad: 'PRESENCIAL' };
}

function emptyForm(trabajadorId = ''): NuevoContratoForm {
  return {
    tipoSesion: '', trabajadorId, cuotaMensual: null,
    fechaInicio: '', notas: '', slots: [emptySlot()],
  };
}

@Component({
  standalone: true,
  selector: 'app-contratos-tab',
  imports: [CommonModule, FormsModule],
  template: `
<div class="contratos-tab">

  <!-- Header -->
  <div class="ct-header">
    <div class="ct-header-left">
      <h4 class="ct-title">
        <i class="bi bi-file-earmark-ruled me-2"></i>Contratos de servicio
      </h4>
      <span *ngIf="contratosActivos().length" class="ct-count-badge">
        {{ contratosActivos().length }} activo{{ contratosActivos().length !== 1 ? 's' : '' }}
      </span>
    </div>
    <button *ngIf="!auth.isRecep()" class="ct-btn-nuevo" (click)="abrirModal()" type="button">
      <i class="bi bi-plus-circle me-1"></i> Nuevo contrato
    </button>
  </div>

  <div *ngIf="errorGlobal()" class="ct-alert ct-alert-danger">
    <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorGlobal() }}
  </div>

  <div *ngIf="cargando()" class="ct-loading">
    <span class="spinner-border spinner-border-sm me-2"></span>Cargando contratos…
  </div>

  <ng-container *ngIf="!cargando()">

    <div *ngIf="!contratosActivos().length && !contratosHistorico().length" class="ct-empty">
      <div class="ct-empty-icon"><i class="bi bi-file-earmark-ruled"></i></div>
      <p class="ct-empty-title">Sin contratos de servicio</p>
      <p class="ct-empty-desc">Crea el primero para empezar a gestionar cuotas mensuales</p>
      <button *ngIf="!auth.isRecep()" class="ct-btn-nuevo" (click)="abrirModal()" type="button">
        <i class="bi bi-plus-circle me-1"></i> Crear primer contrato
      </button>
    </div>

    <!-- Contratos activos -->
    <div *ngIf="contratosActivos().length" class="ct-section">
      <div class="ct-cards">
        <div *ngFor="let c of contratosActivos()" class="ct-card">

          <div class="ct-card-badges">
            <span class="ct-badge" [class]="'ct-badge-' + c.estado.toLowerCase()">{{ estadoLabel(c.estado) }}</span>
            <span class="ct-badge-tipo" [style.background]="tipoBg(c.tipoSesion)" [style.color]="tipoColor(c.tipoSesion)">
              {{ tipoLabel(c.tipoSesion) }}
            </span>
          </div>

          <div class="ct-card-main">
            <div class="ct-card-cuota">
              {{ c.cuotaMensual | number:'1.2-2' }} €
              <span class="ct-card-cuota-label">/mes</span>
            </div>
            <!-- Slots -->
            <div class="ct-card-slots">
              <div *ngFor="let s of c.slots" class="ct-slot-row">
                <i class="bi" [class.bi-camera-video]="s.modalidad === 'ONLINE'" [class.bi-person]="s.modalidad === 'PRESENCIAL'"></i>
                <span>{{ diaLabel(s.diaSemana) }} {{ s.horaInicio }}–{{ s.horaFin }}</span>
                <span class="ct-slot-dur">({{ s.duracionMinutos }} min)</span>
                <span class="ct-slot-modalidad" [class.ct-slot-online]="s.modalidad === 'ONLINE'">
                  {{ s.modalidad === 'ONLINE' ? 'Online' : 'Presencial' }}
                </span>
              </div>
            </div>
          </div>

          <div class="ct-card-details">
            <div class="ct-detail-row">
              <span class="ct-detail-label"><i class="bi bi-person me-1"></i>Terapeuta</span>
              <span class="ct-detail-val">
                {{ c.trabajador.nombre }} {{ c.trabajador.apellidos }}
                <span *ngIf="c.trabajador.especialidad" class="ct-detail-meta">— {{ c.trabajador.especialidad }}</span>
              </span>
            </div>
            <div class="ct-detail-row">
              <span class="ct-detail-label"><i class="bi bi-calendar me-1"></i>Vigencia</span>
              <span class="ct-detail-val">
                {{ c.fechaInicio | date:'dd/MM/yyyy' }}
                <span class="ct-detail-sep">→</span>
                {{ c.fechaFin ? (c.fechaFin | date:'dd/MM/yyyy') : 'Indefinido' }}
              </span>
            </div>
            <div class="ct-detail-row">
              <span class="ct-detail-label"><i class="bi bi-calendar2-week me-1"></i>Sesiones</span>
              <span class="ct-badge-sesiones">{{ c._count.sesiones }} programadas</span>
            </div>
            <div *ngIf="c.notas" class="ct-detail-row">
              <span class="ct-detail-label"><i class="bi bi-chat-left-text me-1"></i>Notas</span>
              <span class="ct-detail-val ct-detail-notas">{{ c.notas }}</span>
            </div>
          </div>

          <div *ngIf="confirmFinalizarId() === c.id" class="ct-confirm-finalizar">
            <p class="ct-confirm-text">
              <i class="bi bi-exclamation-triangle-fill me-1 text-warning"></i>
              ¿Finalizar este contrato? Se cancelarán las sesiones futuras programadas.
            </p>
            <div class="ct-confirm-actions">
              <button class="ct-btn-ghost" (click)="cancelarFinalizar()" type="button">Cancelar</button>
              <button class="ct-btn-danger" [disabled]="finalizando()" (click)="confirmarFinalizar(c.id)" type="button">
                <span *ngIf="finalizando()" class="spinner-border spinner-border-sm me-1" style="width:12px;height:12px"></span>
                Sí, finalizar
              </button>
            </div>
          </div>

          <div *ngIf="confirmFinalizarId() !== c.id" class="ct-card-actions">
            <button class="ct-btn-pdf" (click)="descargarPdf(c.id)" [disabled]="descargandoId() === c.id" type="button">
              <span *ngIf="descargandoId() === c.id" class="spinner-border spinner-border-sm" style="width:11px;height:11px"></span>
              <i *ngIf="descargandoId() !== c.id" class="bi bi-file-earmark-pdf me-1"></i>
              Contrato PDF
            </button>
            <button *ngIf="puedeGestionar(c)" class="ct-btn-finalizar" (click)="solicitarFinalizar(c.id)" type="button">
              <i class="bi bi-x-circle me-1"></i> Finalizar
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Historial -->
    <div *ngIf="contratosHistorico().length" class="ct-historial">
      <button class="ct-historial-toggle" (click)="mostrarHistorial.set(!mostrarHistorial())" type="button">
        <i class="bi" [class.bi-chevron-down]="!mostrarHistorial()" [class.bi-chevron-up]="mostrarHistorial()"></i>
        Historial ({{ contratosHistorico().length }})
      </button>

      <div *ngIf="mostrarHistorial()" class="ct-historial-tabla">
        <table class="ct-table">
          <thead>
            <tr><th>Tipo</th><th>Terapeuta</th><th>Cuota</th><th>Inicio</th><th>Fin</th><th>Estado</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of contratosHistorico()">
              <td><span class="ct-badge-tipo-sm" [style.color]="tipoColor(c.tipoSesion)">{{ tipoLabel(c.tipoSesion) }}</span></td>
              <td>{{ c.trabajador.nombre }} {{ c.trabajador.apellidos }}</td>
              <td>{{ c.cuotaMensual | number:'1.2-2' }} €/mes</td>
              <td>{{ c.fechaInicio | date:'dd/MM/yyyy' }}</td>
              <td>{{ c.fechaFin ? (c.fechaFin | date:'dd/MM/yyyy') : '—' }}</td>
              <td><span class="ct-badge" [class]="'ct-badge-' + c.estado.toLowerCase()">{{ estadoLabel(c.estado) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </ng-container>
</div>

<!-- ── Modal Nuevo Contrato ─────────────────────────────────── -->
<div *ngIf="modalAbierto()" class="ct-modal-overlay" (click)="cerrarModalSiFondo($event)">
  <div class="ct-modal" role="dialog">
    <div class="ct-modal-header">
      <h5 class="ct-modal-title"><i class="bi bi-file-earmark-plus me-2"></i>Nuevo contrato</h5>
      <button class="ct-modal-close" (click)="cerrarModal()" type="button"><i class="bi bi-x-lg"></i></button>
    </div>

    <div class="ct-modal-body">

      <div *ngIf="errorModal()" class="ct-alert ct-alert-danger mb-3">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorModal() }}
      </div>

      <!-- Tipo -->
      <div class="ct-field">
        <label class="ct-label">Tipo de terapia *</label>
        <select class="ct-select" [ngModel]="form().tipoSesion" (ngModelChange)="patchForm('tipoSesion', $event)">
          <option value="">Seleccionar tipo…</option>
          <option value="PEDAGOGIA">Pedagogía</option>
          <option value="NEUROPSICOLOGIA">Neuropsicología</option>
          <option value="LOGOPEDIA">Logopedia</option>
          <option value="TERAPIA_OCUPACIONAL">Ter. Ocupacional</option>
        </select>
      </div>

      <!-- Terapeuta (solo ADMIN) -->
      <div *ngIf="auth.isAdmin()" class="ct-field">
        <label class="ct-label">Terapeuta *</label>
        <select class="ct-select" [ngModel]="form().trabajadorId" (ngModelChange)="patchForm('trabajadorId', $event)">
          <option value="">Seleccionar terapeuta…</option>
          <option *ngFor="let t of trabajadorSvc.trabajadores()" [value]="t.id">
            {{ t.nombre }} {{ t.apellidos }}<span *ngIf="t.especialidad"> — {{ t.especialidad }}</span>
          </option>
        </select>
      </div>

      <!-- Cuota -->
      <div class="ct-field">
        <label class="ct-label">Cuota mensual (€) *</label>
        <input type="number" class="ct-input" placeholder="120.00" min="0" step="0.01"
          [ngModel]="form().cuotaMensual" (ngModelChange)="patchForm('cuotaMensual', $event)" />
      </div>

      <!-- Fecha inicio -->
      <div class="ct-field">
        <label class="ct-label">Fecha de inicio *</label>
        <input type="date" class="ct-input"
          [ngModel]="form().fechaInicio" (ngModelChange)="patchForm('fechaInicio', $event)" />
      </div>

      <!-- ── SLOTS ────────────────────────────────────────── -->
      <div class="ct-slots-section">
        <div class="ct-slots-header">
          <span class="ct-label">Sesiones semanales *</span>
          <button class="ct-btn-add-slot" type="button" (click)="addSlot()">
            <i class="bi bi-plus-circle me-1"></i> Añadir día
          </button>
        </div>

        <div *ngFor="let s of form().slots; let i = index; trackBy: trackByIdx" class="ct-slot-form">
          <div class="ct-slot-form-header">
            <span class="ct-slot-num">Sesión {{ i + 1 }}</span>
            <button *ngIf="form().slots.length > 1" class="ct-slot-remove" type="button"
              (click)="removeSlot(i)" title="Eliminar">
              <i class="bi bi-trash3"></i>
            </button>
          </div>

          <div class="ct-field-row">
            <div class="ct-field">
              <label class="ct-label">Día *</label>
              <select class="ct-select" [ngModel]="s.diaSemana" (ngModelChange)="patchSlot(i, 'diaSemana', $event ? +$event : '')">
                <option value="">Día…</option>
                <option [value]="1">Lunes</option>
                <option [value]="2">Martes</option>
                <option [value]="3">Miércoles</option>
                <option [value]="4">Jueves</option>
                <option [value]="5">Viernes</option>
                <option [value]="6">Sábado</option>
                <option [value]="7">Domingo</option>
              </select>
            </div>
            <div class="ct-field">
              <label class="ct-label">Duración (min) *</label>
              <input type="number" class="ct-input" placeholder="50" min="15" max="240"
                [ngModel]="s.duracionMinutos" (ngModelChange)="patchSlot(i, 'duracionMinutos', $event)" />
            </div>
          </div>

          <div class="ct-field-row">
            <div class="ct-field">
              <label class="ct-label">Hora inicio *</label>
              <input type="time" class="ct-input" [ngModel]="s.horaInicio"
                (ngModelChange)="patchSlot(i, 'horaInicio', $event)" />
            </div>
            <div class="ct-field">
              <label class="ct-label">Hora fin *</label>
              <input type="time" class="ct-input" [ngModel]="s.horaFin"
                (ngModelChange)="patchSlot(i, 'horaFin', $event)" />
            </div>
          </div>

          <div class="ct-field ct-modalidad-toggle">
            <label class="ct-label">Modalidad *</label>
            <div class="ct-toggle-group">
              <button type="button"
                class="ct-toggle-btn"
                [class.ct-toggle-active]="s.modalidad === 'PRESENCIAL'"
                (click)="patchSlot(i, 'modalidad', 'PRESENCIAL')">
                <i class="bi bi-person-fill me-1"></i>Presencial
              </button>
              <button type="button"
                class="ct-toggle-btn ct-toggle-online"
                [class.ct-toggle-active]="s.modalidad === 'ONLINE'"
                (click)="patchSlot(i, 'modalidad', 'ONLINE')">
                <i class="bi bi-camera-video-fill me-1"></i>Online
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Notas -->
      <div class="ct-field">
        <label class="ct-label">Notas <span class="ct-label-opt">(opcional)</span></label>
        <textarea class="ct-textarea" rows="2" placeholder="Observaciones sobre el contrato…"
          [ngModel]="form().notas" (ngModelChange)="patchForm('notas', $event)"></textarea>
      </div>

    </div>

    <div class="ct-modal-footer">
      <button class="ct-btn-ghost" (click)="cerrarModal()" type="button">Cancelar</button>
      <button class="ct-btn-primary" [disabled]="creando() || !formValido()" (click)="crearContrato()" type="button">
        <span *ngIf="creando()" class="spinner-border spinner-border-sm me-1" style="width:14px;height:14px"></span>
        <i *ngIf="!creando()" class="bi bi-check-circle me-1"></i>
        {{ creando() ? 'Creando…' : 'Crear contrato' }}
      </button>
    </div>
  </div>
</div>
  `,
})
export class ContratosTabComponent implements OnInit {
  private route            = inject(ActivatedRoute);
  readonly auth            = inject(AuthService);
  readonly contratosService = inject(ContratosService);
  readonly trabajadorSvc    = inject(TrabajadorService);

  cargando           = signal(false);
  errorGlobal        = signal<string | null>(null);
  modalAbierto       = signal(false);
  creando            = signal(false);
  errorModal         = signal<string | null>(null);
  finalizando        = signal(false);
  confirmFinalizarId = signal<string | null>(null);
  mostrarHistorial   = signal(false);
  descargandoId      = signal<string | null>(null);

  private clienteId = '';

  readonly contratosActivos = computed(() =>
    this.contratosService.contratosCliente().filter(
      c => c.estado === 'ACTIVO' || c.estado === 'BORRADOR',
    ),
  );

  readonly contratosHistorico = computed(() =>
    this.contratosService.contratosCliente().filter(
      c => c.estado === 'FINALIZADO' || c.estado === 'SUSPENDIDO',
    ),
  );

  private _form = signal<NuevoContratoForm>(emptyForm());
  readonly form  = this._form.asReadonly();

  ngOnInit(): void {
    this.clienteId = this.route.parent?.snapshot.paramMap.get('id') ?? '';
    this.cargar();
    if (this.auth.isAdmin()) {
      this.trabajadorSvc.getTrabajadores().subscribe();
    }
  }

  cargar(): void {
    this.cargando.set(true);
    this.errorGlobal.set(null);
    this.contratosService.loadContratosCliente(this.clienteId)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ error: () => this.errorGlobal.set('Error al cargar los contratos') });
  }

  abrirModal(): void {
    const prefillId = this.auth.isAdmin() ? '' : (this.auth.currentTrabajadorId() ?? '');
    this._form.set(emptyForm(prefillId));
    this.errorModal.set(null);
    this.modalAbierto.set(true);
  }

  cerrarModal(): void { this.modalAbierto.set(false); }

  cerrarModalSiFondo(e: Event): void {
    if ((e.target as HTMLElement).classList.contains('ct-modal-overlay')) {
      this.cerrarModal();
    }
  }

  patchForm<K extends keyof NuevoContratoForm>(key: K, value: NuevoContratoForm[K]): void {
    this._form.update(f => ({ ...f, [key]: value }));
  }

  patchSlot<K extends keyof SlotForm>(idx: number, key: K, value: SlotForm[K]): void {
    this._form.update(f => {
      const slots = f.slots.map((s, i) => i === idx ? { ...s, [key]: value } : s);
      return { ...f, slots };
    });
  }

  addSlot(): void {
    this._form.update(f => ({ ...f, slots: [...f.slots, emptySlot()] }));
  }

  removeSlot(idx: number): void {
    this._form.update(f => ({ ...f, slots: f.slots.filter((_, i) => i !== idx) }));
  }

  trackByIdx(idx: number): number { return idx; }

  readonly formValido = computed(() => {
    const f = this._form();
    if (!f.tipoSesion || f.cuotaMensual === null || f.cuotaMensual < 0 || !f.fechaInicio) return false;
    if (this.auth.isAdmin() && !f.trabajadorId) return false;
    return f.slots.length > 0 && f.slots.every(s =>
      s.diaSemana !== '' && s.horaInicio && s.horaFin &&
      s.duracionMinutos !== null && s.duracionMinutos >= 15,
    );
  });

  crearContrato(): void {
    const f = this._form();
    if (!this.formValido()) return;

    const payload: CreateContratoPayload = {
      clienteId:    this.clienteId,
      tipoSesion:   f.tipoSesion as TipoSesion,
      cuotaMensual: f.cuotaMensual!,
      fechaInicio:  f.fechaInicio,
      slots:        f.slots.map(s => ({
        diaSemana:       s.diaSemana as number,
        horaInicio:      s.horaInicio,
        horaFin:         s.horaFin,
        duracionMinutos: s.duracionMinutos!,
        modalidad:       s.modalidad,
      })) as SlotPayload[],
      ...(f.notas && { notas: f.notas }),
      ...(this.auth.isAdmin() && f.trabajadorId && { trabajadorId: f.trabajadorId }),
    };

    this.creando.set(true);
    this.errorModal.set(null);
    this.contratosService.crear(payload)
      .pipe(finalize(() => this.creando.set(false)))
      .subscribe({
        next: () => { this.cerrarModal(); this.cargar(); },
        error: (err: any) => this.errorModal.set(err?.error?.message ?? 'Error al crear el contrato'),
      });
  }

  descargarPdf(id: string): void {
    this.descargandoId.set(id);
    this.contratosService.descargarPdf(id)
      .pipe(finalize(() => this.descargandoId.set(null)))
      .subscribe({ error: () => this.errorGlobal.set('Error al generar el PDF del contrato') });
  }

  solicitarFinalizar(id: string): void  { this.confirmFinalizarId.set(id); }
  cancelarFinalizar(): void             { this.confirmFinalizarId.set(null); }

  confirmarFinalizar(id: string): void {
    this.finalizando.set(true);
    this.contratosService.finalizar(id)
      .pipe(finalize(() => this.finalizando.set(false)))
      .subscribe({
        next: () => { this.confirmFinalizarId.set(null); this.cargar(); },
        error: (err: any) => {
          this.errorGlobal.set(err?.error?.message ?? 'Error al finalizar el contrato');
          this.confirmFinalizarId.set(null);
        },
      });
  }

  puedeGestionar(c: ContratoServicio): boolean {
    if (this.auth.isAdmin()) return true;
    return c.trabajadorId === this.auth.currentTrabajadorId() && c.estado === 'ACTIVO';
  }

  diaLabel(n: number): string    { return DIAS[n] ?? ''; }
  tipoLabel(t: string): string   { return TIPO_SESION_LABELS[t as TipoSesion] ?? t; }
  tipoColor(t: string): string   { return TIPO_COLOR[t] ?? '#6b7280'; }
  tipoBg(t: string): string      { return (TIPO_COLOR[t] ?? '#6b7280') + '18'; }
  estadoLabel(e: string): string { return ESTADO_CONTRATO_LABEL[e as keyof typeof ESTADO_CONTRATO_LABEL] ?? e; }
}

export default ContratosTabComponent;

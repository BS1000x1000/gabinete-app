import {
  Component,
  DestroyRef,
  HostListener,
  OnDestroy,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NuevaSesionModalService } from '../../../services/nueva-sesion-modal.service';
import { SesionesService } from '../../../services/sesiones.service';
import { ClientesService } from '../../../services/cliente.service';
import { TrabajadorService } from '../../../services/trabajadores.service';
import { TipoSesion, TIPO_SESION_LABELS, AvisoSesion } from '../../../interface/sesion.interface';
import { ClienteDataBackend } from '../../../interface/cliente-backend.interface';

@Component({
  selector: 'app-nueva-sesion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nueva-sesion-modal.component.html',
})
export class NuevaSesionModalComponent implements OnDestroy {
  readonly modalSvc    = inject(NuevaSesionModalService);
  private sesionesSvc  = inject(SesionesService);
  private clientesSvc  = inject(ClientesService);
  private trabajadorSvc = inject(TrabajadorService);
  private destroyRef   = inject(DestroyRef);
  private fb           = inject(FormBuilder);

  readonly isOpen = this.modalSvc.isOpen;

  clientes     = signal<ClienteDataBackend[]>([]);
  trabajadores = this.trabajadorSvc.trabajadores;

  isSaving     = signal(false);
  saveSuccess  = signal(false);
  saveError    = signal<string | null>(null);

  /**
   * Avisos devueltos al crear (solape, fuera de jornada, vacaciones, festivo).
   * La sesión ya está creada cuando se rellenan: son informativos.
   */
  avisos = signal<AvisoSesion[]>([]);

  readonly AVISO_ICONO: Record<AvisoSesion['tipo'], string> = {
    FESTIVO:                 'bi-calendar2-x',
    VACACIONES:              'bi-umbrella',
    FUERA_DE_DISPONIBILIDAD: 'bi-clock-history',
    SOLAPE_TERAPEUTA:        'bi-people',
    SOLAPE_CLIENTE:          'bi-person-exclamation',
  };

  cerrarTrasAvisos(): void {
    this.avisos.set([]);
    this.modalSvc.close();
  }

  private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;

  readonly TIPOS_SESION = [
    { value: 'PEDAGOGIA',          label: TIPO_SESION_LABELS['PEDAGOGIA'] },
    { value: 'NEUROPSICOLOGIA',    label: TIPO_SESION_LABELS['NEUROPSICOLOGIA'] },
    { value: 'LOGOPEDIA',          label: TIPO_SESION_LABELS['LOGOPEDIA'] },
    { value: 'TERAPIA_OCUPACIONAL',label: TIPO_SESION_LABELS['TERAPIA_OCUPACIONAL'] },
    { value: 'EVALUACION',         label: TIPO_SESION_LABELS['EVALUACION'] },
    { value: 'REUNION_COLEGIO',    label: TIPO_SESION_LABELS['REUNION_COLEGIO'] },
  ];

  form = this.fb.group({
    clienteId:    ['', Validators.required],
    trabajadorId: ['', Validators.required],
    tipoSesion:   ['PEDAGOGIA', Validators.required],
    fecha:        [this.hoy(), Validators.required],
    horaInicio:   ['', Validators.required],
    horaFin:      ['', Validators.required],
    notas:        [''],
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) this.onOpen();
    });
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private onOpen(): void {
    this.form.reset({
      clienteId: this.modalSvc.clientePreseleccionado() ?? '', trabajadorId: '', tipoSesion: 'PEDAGOGIA',
      fecha: this.hoy(), horaInicio: '', horaFin: '', notas: '',
    });
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.isSaving.set(false);

    this.clientesSvc.getMisClientes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (cs) => this.clientes.set(cs) });

    this.trabajadorSvc.getTrabajadores()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const fecha = v.fecha!;

    this.isSaving.set(true);
    this.saveError.set(null);

    const dto = {
      clienteId:      v.clienteId!,
      trabajadorId:   v.trabajadorId!,
      tipoSesion:     v.tipoSesion! as TipoSesion,
      fechaHoraInicio: `${fecha}T${v.horaInicio}:00`,
      fechaHoraFin:    `${fecha}T${v.horaFin}:00`,
      notas:           v.notas || undefined,
    };

    this.sesionesSvc.createSesion(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (sesion) => {
          this.isSaving.set(false);

          // Con avisos NO se cierra solo: la sesión queda creada -avisar no es
          // bloquear- pero cerrar el modal a los 1,4 s los haría invisibles, que
          // es justo lo que llevaba pasando.
          const avisos = sesion?.avisos ?? [];
          if (avisos.length > 0) {
            this.avisos.set(avisos);
            return;
          }

          this.saveSuccess.set(true);
          this.saveTimeoutId = setTimeout(() => {
            this.saveSuccess.set(false);
            this.modalSvc.close();
          }, 1400);
        },
        error: (err) => {
          this.saveError.set(err?.error?.message ?? 'Error al crear la sesión');
          this.isSaving.set(false);
        },
      });
  }

  close(): void {
    this.modalSvc.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.modalSvc.close();
  }

  ngOnDestroy(): void {
    if (this.saveTimeoutId) clearTimeout(this.saveTimeoutId);
  }
}

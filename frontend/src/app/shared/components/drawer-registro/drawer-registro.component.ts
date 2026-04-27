import {
  Component,
  DestroyRef,
  inject,
  signal,
  computed,
  effect,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { RegistroDrawerService } from '../../../services/registro-drawer.service';
import { RegistrosService } from '../../../services/registros.service';
import { ClientesService } from '../../../services/cliente.service';
import { ClienteDataBackend } from '../../../interface/cliente-backend.interface';
import { ObjetivoGeneral } from '../../../interface/objetivo-general.interface';
import { EtiquetaRegistro, ETIQUETAS_META, ETIQUETAS_OPCIONALES } from '../../../interface/registro-diario.interface';
import { toggleInArray } from '../../utils/array.utils';

interface AreaConObjetivos {
  id: string;
  nombre: string;
  color: string;
  objetivos: ObjetivoGeneral[];
}

@Component({
  selector: 'app-drawer-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './drawer-registro.component.html',
})
export class DrawerRegistroComponent implements OnDestroy {
  readonly drawerSvc    = inject(RegistroDrawerService);
  private registrosSvc  = inject(RegistrosService);
  private clientesSvc   = inject(ClientesService);
  private destroyRef    = inject(DestroyRef);
  private fb            = inject(FormBuilder);

  readonly state = this.drawerSvc.state;

  readonly etiquetasMeta = ETIQUETAS_META;
  readonly etiquetasOpcionales = ETIQUETAS_OPCIONALES;

  // ── Datos de soporte ──────────────────────────────────
  clientes              = signal<ClienteDataBackend[]>([]);
  areaConObjetivos      = signal<AreaConObjetivos[]>([]);
  objetivosSeleccionados  = signal<Set<string>>(new Set());
  etiquetasSeleccionadas  = signal<EtiquetaRegistro[]>([]);

  // ── Estado de UI ──────────────────────────────────────
  isSaving           = signal(false);
  saveSuccess        = signal(false);
  saveError          = signal<string | null>(null);
  isLoadingObjetivos = signal(false);

  private saveTimeoutId: ReturnType<typeof setTimeout> | null = null;

  // ── Formulario ────────────────────────────────────────
  form = this.fb.group({
    clienteId:     ['', Validators.required],
    contenido:     ['', [Validators.required, Validators.minLength(10)]],
    fechaRegistro: [this.hoy()],
  });

  // Getters para evitar form.get() repetidos en template
  get clienteIdCtrl(): FormControl { return this.form.get('clienteId') as FormControl; }
  get contenidoCtrl():  FormControl { return this.form.get('contenido')  as FormControl; }

  readonly tieneContexto             = computed(() => !!this.state().clienteId);
  readonly totalObjetivosSeleccionados = computed(() => this.objetivosSeleccionados().size);

  constructor() {
    effect(() => {
      const s = this.state();
      if (s.isOpen) this.onOpen(s.clienteId);
    });
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  private onOpen(clienteId: string | null): void {
    this.reset();
    this.cargarClientes();
    if (clienteId) {
      this.form.patchValue({ clienteId });
      this.cargarObjetivosDeCliente(clienteId);
    }
  }

  private cargarClientes(): void {
    this.clientesSvc.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (cs) => this.clientes.set(cs) });
  }

  onClienteChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    if (id) this.cargarObjetivosDeCliente(id);
    else this.areaConObjetivos.set([]);
  }

  private cargarObjetivosDeCliente(clienteId: string): void {
    this.isLoadingObjetivos.set(true);
    this.clientesSvc.getObjetivosCliente(clienteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          const areaMap = new Map<string, AreaConObjetivos>();
          for (const obj of resp.objetivos) {
            const areaKey = obj.area;
            if (!areaMap.has(areaKey)) {
              areaMap.set(areaKey, {
                id:       areaKey,
                nombre:   obj.area,
                color:    obj.color ?? '#7c6fd6',
                objetivos: [],
              });
            }
            areaMap.get(areaKey)!.objetivos.push({
              id:               obj.objetivoGeneralId,
              titulo:           obj.titulo,
              activo:           true,
              areaDesarrolloId: areaKey,
              areaDesarrollo: {
                id:     areaKey,
                nombre: obj.area,
                color:  obj.color,
                orden:  0,
                activo: true,
              },
            });
          }
          this.areaConObjetivos.set(Array.from(areaMap.values()));
          this.isLoadingObjetivos.set(false);
        },
        error: () => {
          this.areaConObjetivos.set([]);
          this.isLoadingObjetivos.set(false);
        },
      });
  }

  toggleObjetivo(objetivoId: string): void {
    const sel = new Set(this.objetivosSeleccionados());
    if (sel.has(objetivoId)) sel.delete(objetivoId);
    else sel.add(objetivoId);
    this.objetivosSeleccionados.set(sel);
  }

  isObjetivoSelected(objetivoId: string): boolean {
    return this.objetivosSeleccionados().has(objetivoId);
  }

  toggleEtiqueta(etiqueta: EtiquetaRegistro): void {
    this.etiquetasSeleccionadas.update(prev => toggleInArray(prev, etiqueta));
  }

  isEtiquetaSelected(etiqueta: EtiquetaRegistro): boolean {
    return this.etiquetasSeleccionadas().includes(etiqueta);
  }

  save(): void {
    if (this.form.invalid || this.isSaving()) return;

    const v = this.form.value;
    this.isSaving.set(true);
    this.saveError.set(null);

    const dto = {
      clienteId:                    v.clienteId!,
      contenido:                    v.contenido!,
      fechaRegistro:                v.fechaRegistro ? new Date(v.fechaRegistro).toISOString() : undefined,
      sesionId:                     this.state().sesionId ?? undefined,
      etiquetas:                    (['REGISTRO_DIARIO', ...this.etiquetasSeleccionadas()] as EtiquetaRegistro[]),
      objetivosGeneralesTrabajados: Array.from(this.objetivosSeleccionados()).map((id) => ({ objetivoGeneralId: id })),
    };

    this.registrosSvc.createRegistro(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saveSuccess.set(true);
          this.isSaving.set(false);
          this.saveTimeoutId = setTimeout(() => {
            this.saveSuccess.set(false);
            this.drawerSvc.close();
          }, 1400);
        },
        error: (err) => {
          this.saveError.set(err?.error?.message ?? 'Error al guardar el registro');
          this.isSaving.set(false);
        },
      });
  }

  close(): void {
    this.drawerSvc.close();
  }

  private reset(): void {
    this.form.reset({ fechaRegistro: this.hoy(), clienteId: '', contenido: '' });
    this.objetivosSeleccionados.set(new Set());
    this.etiquetasSeleccionadas.set([]);
    this.areaConObjetivos.set([]);
    this.saveError.set(null);
    this.saveSuccess.set(false);
    this.isSaving.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.state().isOpen) this.drawerSvc.close();
  }

  ngOnDestroy(): void {
    if (this.saveTimeoutId) clearTimeout(this.saveTimeoutId);
  }
}

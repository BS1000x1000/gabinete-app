import {
  Component,
  inject,
  computed,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ClientesService } from '../../../services/cliente.service';
import { Subject, takeUntil } from 'rxjs';
import { DrawerService } from '../../../services/drawer.service';

@Component({
  selector: 'app-cliente-drawer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-drawer.component.html',
})
export class ClienteDrawerComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  readonly drawerSvc = inject(DrawerService);
  private clientesSvc = inject(ClientesService);
  private fb = inject(FormBuilder);

  readonly state = this.drawerSvc.state;

  // Signals de datos actuales
  readonly cliente   = this.clientesSvc.cliente;
  readonly clienteRaw = this.clientesSvc.clienteRaw;
  readonly sanitario = this.clientesSvc.sanitario;
  readonly escolar   = this.clientesSvc.escolar;
  readonly colegio   = this.clientesSvc.colegio;
  readonly familiares = this.clientesSvc.contactosFamiliares;

  isSaving = false;
  saveError: string | null = null;
  saveSuccess = false;

  // ── Título dinámico según sección ──
  readonly sectionTitle = computed(() => {
    const titles: Record<string, string> = {
      personal:  'Datos personales',
      sanitario: 'Información médica',
      contactos: 'Contactos familiares',
      colegio:   'Centro educativo',
    };
    return titles[this.state().section ?? ''] ?? 'Editar';
  });

  readonly sectionIcon = computed(() => {
    const icons: Record<string, string> = {
      personal:  'bi-person-fill',
      sanitario: 'bi-heart-pulse-fill',
      contactos: 'bi-people-fill',
      colegio:   'bi-building',
    };
    return icons[this.state().section ?? ''] ?? 'bi-pencil';
  });

  // ── Formularios ──
  formPersonal = this.fb.group({
    nombre:          ['', [Validators.required, Validators.minLength(2)]],
    apellidos:       ['', [Validators.required, Validators.minLength(2)]],
    fechaNacimiento: ['', Validators.required],
    dni:             ['', Validators.pattern(/^\d{8}[A-Z]$/)],
    domicilio:       [''],
    ciudad:          [''],
    provincia:       [''],
    curso:           [''],
    fechaInicio:     [''],
  });

  formSanitario = this.fb.group({
    diagnostico:      [''],
    centroSalud:      [''],
    tratamientos:     [''],
    // Profesionales sanitarios externos (psicólogo, logopeda...)
    especialistas:    this.fb.array([]),
  });

  formContactos = this.fb.group({
    contactos: this.fb.array([]),
  });

  formColegio = this.fb.group({
    nombre:            [''],
    direccionColegio:  [''],
    ctoColegioUno:     [''],
    ctoTelefonoUno:    [''],
    ctoEmailColegioUno:['', Validators.email],
    ctoRelacionColegioUno: [''],
    ctoColegioDos:     [''],
    ctoTelefonoDos:    [''],
    ctoEmailColegioDos:['', Validators.email],
    ctoRelacionColegioDos: [''],

    // Situación escolar DEL NIÑO (modelo Escolar, no Colegio):
    // el centro se comparte entre clientes, esto no.
    adaptaciones:      [false],
    tipoAdaptaciones:  [''],
    apoyos:            [false],
    especialistasColegio: this.fb.array([]),
  });

  // ── Getters para FormArrays ──
  get especialistas(): FormArray {
    return this.formSanitario.get('especialistas') as FormArray;
  }

  get especialistasColegio(): FormArray {
    return this.formColegio.get('especialistasColegio') as FormArray;
  }

  get contactosArray(): FormArray {
    return this.formContactos.get('contactos') as FormArray;
  }

  // ── Escuchar cambios del drawer para prellenar ──
  constructor() {
    // Rellenar formularios cuando se abre el drawer
    import('@angular/core').then(({ effect }) => {
      // Usamos computed reactivo para detectar apertura
    });
    // Alternativa: watch state changes via a getter in template
  }

  /** Llamado desde el template cuando el drawer abre */
  onDrawerOpened(section: string): void {
    this.saveError = null;
    this.saveSuccess = false;

    if (section === 'personal')  this.fillPersonal();
    if (section === 'sanitario') this.fillSanitario();
    if (section === 'contactos') this.fillContactos();
    if (section === 'colegio')   this.fillColegio();
  }

  private fillPersonal(): void {
    const c = this.clienteRaw();
    const cl = this.cliente();
    if (!c) return;
    this.formPersonal.patchValue({
      nombre:          c.nombre,
      apellidos:       c.apellidos,
      fechaNacimiento: c.fechaNacimiento?.split('T')[0] ?? '',
      dni:             c.dni,
      domicilio:       c.domicilio,
      ciudad:          c.ciudad,
      provincia:       c.provincia,
      curso:           c.curso,
      fechaInicio:     c.fechaInicio?.split('T')[0] ?? '',
    });
  }

  private fillSanitario(): void {
    const s = this.sanitario();
    if (!s) return;
    this.formSanitario.patchValue({
      diagnostico:  s.diagnostico ?? '',
      centroSalud:  s.centroSalud ?? '',
      tratamientos: s.tratamientos ?? '',
    });
    // Rellenar especialistas
    this.especialistas.clear();
    (s.especialistas ?? []).forEach(e => {
      this.especialistas.push(this.fb.control(e, Validators.required));
    });
  }

  private fillContactos(): void {
    this.contactosArray.clear();
    const fams = this.familiares();
    fams.forEach(f => {
      this.contactosArray.push(this.fb.group({
        id:                [f.id],
        nombre:            [f.nombre, Validators.required],
        apellidos:         [f.apellidos, Validators.required],
        parentesco:        [f.parentesco, Validators.required],
        telefono:          [f.telefono, Validators.required],
        email:             [f.email ?? '', Validators.email],
        dni:               [f.dni ?? ''],
        esContactoPrincipal: [f.esContactoPrincipal ?? false],
        esResponsablePago:   [f.esResponsablePago ?? false],
        whatsapp:            [f.whatsapp ?? false],
      }));
    });
    // Si no hay contactos, añadir uno vacío
    if (this.contactosArray.length === 0) this.addContacto();
  }

  private fillColegio(): void {
    const col = this.colegio();
    if (!col) return;
    this.formColegio.patchValue({
      nombre:             col.nombreDelCentro ?? '',
      direccionColegio:   col.direccionColegio ?? '',
      ctoColegioUno:      col.ctoColegioUno ?? '',
      ctoTelefonoUno:     col.ctoTelefonoUno ?? '',
      ctoEmailColegioUno: col.ctoEmailColegioUno ?? '',
      ctoRelacionColegioUno: col.ctoRelacionColegioUno ?? '',
      ctoColegioDos:      col.ctoColegioDos ?? '',
      ctoTelefonoDos:     col.ctoTelefonoDos ?? '',
      ctoEmailColegioDos: col.ctoEmailColegioDos ?? '',
      ctoRelacionColegioDos: col.ctoRelacionColegioDos ?? '',
    });

    const esc = this.escolar();
    this.formColegio.patchValue({
      adaptaciones:     esc?.adaptaciones ?? false,
      tipoAdaptaciones: esc?.tipoAdaptaciones ?? '',
      apoyos:           esc?.apoyos ?? false,
    });
    this.especialistasColegio.clear();
    (esc?.especialistas ?? []).forEach((e) => {
      this.especialistasColegio.push(this.fb.control(e, Validators.required));
    });
  }

  // ── CRUD de arrays ──
  addContacto(): void {
    this.contactosArray.push(this.fb.group({
      id:                [null],
      nombre:            ['', Validators.required],
      apellidos:         ['', Validators.required],
      parentesco:        ['', Validators.required],
      telefono:          ['', Validators.required],
      email:             ['', Validators.email],
      dni:               [''],
      esContactoPrincipal: [false],
      esResponsablePago:   [false],
      whatsapp:            [true],
    }));
  }

  removeContacto(i: number): void {
    if (this.contactosArray.length > 1) this.contactosArray.removeAt(i);
  }

  addEspecialista(): void {
    this.especialistas.push(this.fb.control('', Validators.required));
  }

  addEspecialistaColegio(): void {
    this.especialistasColegio.push(this.fb.control('', Validators.required));
  }

  removeEspecialistaColegio(i: number): void {
    this.especialistasColegio.removeAt(i);
  }

  removeEspecialista(i: number): void {
    this.especialistas.removeAt(i);
  }

  // ── Guardar ──
  async save(): Promise<void> {
    const section = this.state().section;
    const clienteId = this.state().clienteId;
    if (!section || !clienteId) return;

    this.isSaving = true;
    this.saveError = null;

    try {
      if (section === 'personal')  await this.savePersonal(clienteId);
      if (section === 'sanitario') await this.saveSanitario(clienteId);
      if (section === 'contactos') await this.saveContactos(clienteId);
      if (section === 'colegio')   await this.saveColegio(clienteId);

      this.saveSuccess = true;
      // Recargar datos
      this.clientesSvc.loadAll(clienteId).subscribe();
      setTimeout(() => {
        this.saveSuccess = false;
        this.drawerSvc.close();
      }, 1200);
    } catch (e: any) {
      this.saveError = e?.message ?? 'Error al guardar';
    } finally {
      this.isSaving = false;
    }
  }

  private savePersonal(id: string): Promise<void> {
    const v = this.formPersonal.value;
    return new Promise((res, rej) => {
      this.clientesSvc.updateCliente(id, {
        nombre:          v.nombre!,
        apellidos:       v.apellidos!,
        dni:             v.dni!,
        domicilio:       v.domicilio!,
        ciudad:          v.ciudad!,
        provincia:       v.provincia!,
        curso:           v.curso!,
        fechaNacimiento: v.fechaNacimiento!,
        fechaInicio:     v.fechaInicio!,
      }).subscribe({ next: () => res(), error: rej });
    });
  }

  private saveSanitario(clienteId: string): Promise<void> {
    const v = this.formSanitario.value;
    return new Promise((res, rej) => {
      this.clientesSvc.updateSanitario(clienteId, {
        diagnostico:   v.diagnostico!,
        centroSalud:   v.centroSalud!,
        tratamientos:  v.tratamientos!,
        especialistas: this.especialistas.value,
      }).subscribe({ next: () => res(), error: rej });
    });
  }

  private async saveContactos(clienteId: string): Promise<void> {
    const formValues    = this.contactosArray.value as any[];
    const originales    = this.familiares();
    // IDs que ya existían al abrir el drawer
    const idsOriginales = new Set<string>(
      originales.map((f: any) => f.id).filter(Boolean)
    );

    const ops: Promise<void>[] = [];

    for (const c of formValues) {
      const payload = {
        nombre:              c.nombre,
        apellidos:           c.apellidos,
        parentesco:          c.parentesco,
        telefono:            c.telefono,
        email:               c.email    || null,
        dni:                 c.dni      || null,
        esContactoPrincipal: c.esContactoPrincipal ?? false,
        esResponsablePago:   c.esResponsablePago   ?? false,
        whatsapp:            c.whatsapp             ?? false,
      };

      if (c.id && idsOriginales.has(c.id)) {
        // Actualizar familiar existente
        ops.push(new Promise((res, rej) =>
          this.clientesSvc.updateFamiliar(clienteId, c.id, payload)
            .subscribe({ next: () => res(), error: rej })
        ));
        idsOriginales.delete(c.id); // marcado como procesado
      } else {
        // Crear nuevo (no tiene id o no estaba en los originales)
        ops.push(new Promise((res, rej) =>
          this.clientesSvc.crearFamiliar(clienteId, payload)
            .subscribe({ next: () => res(), error: rej })
        ));
      }
    }

    // Eliminar los que se quitaron del formulario
    for (const idAEliminar of idsOriginales) {
      ops.push(new Promise((res, rej) =>
        this.clientesSvc.eliminarFamiliar(clienteId, idAEliminar)
          .subscribe({ next: () => res(), error: rej })
      ));
    }

    await Promise.all(ops);
  }

  private saveColegio(clienteId: string): Promise<void> {
    const v = this.formColegio.value;
    return new Promise((res, rej) => {
      this.clientesSvc.updateColegio(clienteId, {
        nombre:               v.nombre!,
        direccionColegio:     v.direccionColegio!,
        ctoColegioUno:        v.ctoColegioUno!,
        ctoTelefonoUno:       v.ctoTelefonoUno!,
        ctoEmailColegioUno:   v.ctoEmailColegioUno!,
        ctoRelacionColegioUno: v.ctoRelacionColegioUno!,
        ctoColegioDos:        v.ctoColegioDos!,
        ctoTelefonoDos:       v.ctoTelefonoDos!,
        ctoEmailColegioDos:   v.ctoEmailColegioDos!,
        ctoRelacionColegioDos: v.ctoRelacionColegioDos!,
      }).subscribe({
        // El colegio y la situación escolar del niño son entidades distintas:
        // se guardan en dos endpoints y el segundo depende del primero.
        next: () => {
          this.clientesSvc.updateEscolar(clienteId, {
            adaptaciones:     v.adaptaciones!,
            tipoAdaptaciones: v.tipoAdaptaciones!,
            apoyos:           v.apoyos!,
            especialistas:    this.especialistasColegio.value,
          }).subscribe({ next: () => res(), error: rej });
        },
        error: rej,
      });
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.drawerSvc.close();
  }

  close(): void {
    this.drawerSvc.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.body.style.overflow = '';
  }
}
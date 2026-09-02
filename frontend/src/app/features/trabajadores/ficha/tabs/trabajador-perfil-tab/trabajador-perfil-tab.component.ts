import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  TrabajadorService,
  Trabajador,
  UpdateTrabajadorPayload,
} from '../../../../../services/trabajadores.service';
import { AuthService } from '../../../../../services/auth.service';

const MEET_URL_REGEX = /^https:\/\/meet\.google\.com\/.+/;

interface EditForm {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  especialidad: string;
  numeroColegiado: string;
  colegioProfesional: string;
  numeroPoliza: string;
  direccionProfesional: string;
  fechaContratacion: string;
  urlVideollamada: string;
}

@Component({
  selector: 'app-trabajador-perfil-tab',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './trabajador-perfil-tab.component.html',
})
export class TrabajadorPerfilTabComponent implements OnInit, OnDestroy {
  private readonly route         = inject(ActivatedRoute);
  private readonly trabajadorSvc = inject(TrabajadorService);
  readonly auth = inject(AuthService);

  private readonly trabajadorId: string = this.route.parent?.snapshot.paramMap.get('id') ?? '';
  private exitoTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly trabajador   = signal<Trabajador | null>(null);
  readonly isLoading    = signal(true);
  readonly editando     = signal(false);
  readonly guardando    = signal(false);
  readonly error        = signal<string | null>(null);
  readonly exito        = signal<string | null>(null);

  readonly form = signal<EditForm>({
    nombre: '', apellidos: '', email: '',
    telefono: '', especialidad: '', numeroColegiado: '',
    colegioProfesional: '', numeroPoliza: '', direccionProfesional: '',
    fechaContratacion: '', urlVideollamada: '',
  });

  ngOnInit(): void {
    // Reuse data already loaded by the shell — avoids a second HTTP call
    const cached = this.trabajadorSvc.currentTrabajador();
    if (cached && cached.id === this.trabajadorId) {
      this.trabajador.set(cached);
      this.isLoading.set(false);
    } else {
      this.cargar();
    }
  }

  ngOnDestroy(): void {
    if (this.exitoTimeout !== null) clearTimeout(this.exitoTimeout);
  }

  cargar(): void {
    this.isLoading.set(true);
    this.trabajadorSvc.getTrabajador(this.trabajadorId).subscribe({
      next: (res) => {
        this.trabajador.set(res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  abrirEdicion(): void {
    const t = this.trabajador();
    if (!t) return;
    this.form.set({
      nombre:           t.nombre            ?? '',
      apellidos:        t.apellidos         ?? '',
      email:            t.email             ?? '',
      telefono:         t.telefono          ?? '',
      especialidad:     t.especialidad      ?? '',
      numeroColegiado:  t.numeroColegiado   ?? '',
      colegioProfesional:   t.colegioProfesional   ?? '',
      numeroPoliza:         t.numeroPoliza         ?? '',
      direccionProfesional: t.direccionProfesional ?? '',
      fechaContratacion: t.fechaContratacion ? t.fechaContratacion.slice(0, 10) : '',
      urlVideollamada:  t.urlVideollamada   ?? '',
    });
    this.error.set(null);
    this.exito.set(null);
    this.editando.set(true);
  }

  cancelarEdicion(): void {
    this.editando.set(false);
    this.error.set(null);
  }

  updateField(field: keyof EditForm, value: string): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  guardar(): void {
    const f = this.form();
    if (!f.nombre.trim() || !f.apellidos.trim() || !f.email.trim()) {
      this.error.set('Nombre, apellidos y email son obligatorios.');
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const url = f.urlVideollamada.trim();
    if (url && !MEET_URL_REGEX.test(url)) {
      this.error.set('La URL de Meet debe tener el formato https://meet.google.com/...');
      this.guardando.set(false);
      return;
    }

    const payload: UpdateTrabajadorPayload = {
      nombre:            f.nombre.trim(),
      apellidos:         f.apellidos.trim(),
      email:             f.email.trim(),
      telefono:          f.telefono.trim()          || undefined,
      especialidad:      f.especialidad.trim()      || undefined,
      numeroColegiado:   f.numeroColegiado.trim()   || undefined,
      colegioProfesional:   f.colegioProfesional.trim()   || undefined,
      numeroPoliza:         f.numeroPoliza.trim()         || undefined,
      direccionProfesional: f.direccionProfesional.trim() || undefined,
      fechaContratacion: f.fechaContratacion.trim()  || undefined,
      urlVideollamada:   url || null,
    };

    // Ficha propia -> `PATCH /me`; ficha ajena -> `PATCH /:id`, que es
    // ADMIN-only. Antes siempre se usaba el segundo, asi que un clinico veia el
    // boton "Editar" en su propia ficha y recibia un 403 al guardar.
    const esPropia = this.auth.currentTrabajadorId() === this.trabajadorId;
    const op$ = esPropia
      ? this.trabajadorSvc.updateMe(payload)
      : this.trabajadorSvc.updateTrabajador(this.trabajadorId, payload);

    op$.subscribe({
      next: (res) => {
        this.trabajador.set(res.data);
        this.editando.set(false);
        this.guardando.set(false);
        this.exito.set('Perfil actualizado correctamente.');
        this.exitoTimeout = setTimeout(() => this.exito.set(null), 3000);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error al guardar los cambios.');
        this.guardando.set(false);
      },
    });
  }
}

export default TrabajadorPerfilTabComponent;

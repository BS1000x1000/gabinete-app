import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  TrabajadorService,
  Trabajador,
  Rol,
  CreateTrabajadorPayload,
  UpdateTrabajadorPayload,
} from '../../services/trabajadores.service';

interface FormTrabajador {
  nombre: string;
  apellidos: string;
  username: string;
  email: string;
  password: string;
  telefono: string;
  numeroColegiado: string;
  especialidad: string;
  rolId: string;
}

interface CredencialesGeneradas {
  username: string;
  password: string;
  nombreCompleto: string;
}

type FiltroEstado = 'activos' | 'inactivos' | 'todos';

@Component({
  selector: 'app-trabajadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trabajadores.component.html',
})
export class TrabajadoresComponent implements OnInit, OnDestroy {
  private trabajadorSvc = inject(TrabajadorService);
  private router = inject(Router);

  isLoading = signal(false);
  guardando = signal(false);

  trabajadores = signal<Trabajador[]>([]);
  roles = signal<Rol[]>([]);

  mostrarModal = signal(false);
  modoModal = signal<'crear' | 'editar'>('crear');
  trabajadorEditandoId = signal<string | null>(null);
  errorModal = signal<string | null>(null);

  confirmDesactivar = signal<Trabajador | null>(null);

  busqueda = signal('');
  filtroRol = signal('todos');
  filtroEstado = signal<FiltroEstado>('activos');

  form = signal<FormTrabajador>({
    nombre: '',
    apellidos: '',
    username: '',
    email: '',
    password: '',
    telefono: '',
    numeroColegiado: '',
    especialidad: '',
    rolId: '',
  });

  // P1 — auto-generación de credenciales
  usernameEditadoManualmente = signal(false);
  credencialesParaMostrar = signal<CredencialesGeneradas | null>(null);
  copiado = signal(false);
  private copiadoTimer: ReturnType<typeof setTimeout> | null = null;

  trabajadoresFiltrados = computed(() => {
    const query = this.busqueda().toLowerCase().trim();
    const rol = this.filtroRol();
    const estado = this.filtroEstado();

    return this.trabajadores().filter((t) => {
      if (query) {
        const nombre = `${t.nombre} ${t.apellidos}`.toLowerCase();
        const email = t.email.toLowerCase();
        if (!nombre.includes(query) && !email.includes(query)) return false;
      }
      if (rol !== 'todos' && t.rol?.id !== rol) return false;
      if (estado === 'activos' && !t.activo) return false;
      if (estado === 'inactivos' && t.activo) return false;
      return true;
    });
  });

  estadisticas = computed(() => {
    const all = this.trabajadores();
    const activos = all.filter((t) => t.activo).length;
    return { total: all.length, activos, inactivos: all.length - activos };
  });

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.isLoading.set(true);
    this.trabajadorSvc.getTrabajadores(true).subscribe({
      next: (res: any) => {
        this.trabajadores.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });

    this.trabajadorSvc.getRoles().subscribe({
      next: (res: any) => this.roles.set(res.data || []),
    });
  }

  // ─── P1: Generación de credenciales ───────────────────────────

  private normalizarTexto(s: string): string {
    return s.toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/[^a-z]/g, '');
  }

  generarUsername(nombre: string, apellidos: string): string {
    const inicial = this.normalizarTexto(nombre.trim()[0] ?? '');
    const partes = apellidos.trim().split(/\s+/);
    const primero = this.normalizarTexto(partes[0] ?? '');
    const segundo = this.normalizarTexto(partes[1] ?? '');

    if (!inicial || !primero) return '';

    const base = inicial + primero;
    const existentes = new Set(
      this.trabajadores().map((t) => t.username?.toLowerCase()).filter(Boolean),
    );

    if (!existentes.has(base) || !segundo) return base;
    return base + segundo;
  }

  generarPasswordSegura(): string {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const special = '!@#$%&*';
    const all = upper + lower + digits + special;

    const required = [
      upper[Math.floor(Math.random() * upper.length)],
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      digits[Math.floor(Math.random() * digits.length)],
      special[Math.floor(Math.random() * special.length)],
      all[Math.floor(Math.random() * all.length)],
    ];

    return required.sort(() => Math.random() - 0.5).join('');
  }

  regenerarPassword() {
    const pwd = this.generarPasswordSegura();
    this.form.update((f) => ({ ...f, password: pwd }));
  }

  onUsernameInput(value: string) {
    this.form.update((f) => ({ ...f, username: value }));
    this.usernameEditadoManualmente.set(true);
  }

  // ─── Modal ─────────────────────────────────────────────────────

  abrirCrear() {
    this.modoModal.set('crear');
    this.trabajadorEditandoId.set(null);
    this.errorModal.set(null);
    this.usernameEditadoManualmente.set(false);
    this.form.set({
      nombre: '',
      apellidos: '',
      username: '',
      email: '',
      password: this.generarPasswordSegura(),
      telefono: '',
      numeroColegiado: '',
      especialidad: '',
      rolId: this.roles()[0]?.id ?? '',
    });
    this.mostrarModal.set(true);
  }

  abrirEditar(t: Trabajador, event: Event) {
    event.stopPropagation();
    this.modoModal.set('editar');
    this.trabajadorEditandoId.set(t.id);
    this.errorModal.set(null);
    this.form.set({
      nombre: t.nombre,
      apellidos: t.apellidos,
      username: t.username ?? '',
      email: t.email,
      password: '',
      telefono: t.telefono ?? '',
      numeroColegiado: t.numeroColegiado ?? '',
      especialidad: t.especialidad ?? '',
      rolId: t.rol?.id ?? '',
    });
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.trabajadorEditandoId.set(null);
    this.errorModal.set(null);
  }

  updateFormField(field: keyof FormTrabajador, value: string) {
    this.form.update((f) => {
      const updated = { ...f, [field]: value };
      if ((field === 'nombre' || field === 'apellidos') && !this.usernameEditadoManualmente()) {
        const nombre = field === 'nombre' ? value : f.nombre;
        const apellidos = field === 'apellidos' ? value : f.apellidos;
        if (nombre.trim() && apellidos.trim()) {
          updated.username = this.generarUsername(nombre, apellidos);
        }
      }
      return updated;
    });
  }

  guardar() {
    const f = this.form();

    if (!f.nombre.trim() || !f.apellidos.trim() || !f.email.trim() || !f.rolId) {
      this.errorModal.set('Nombre, apellidos, email y rol son obligatorios.');
      return;
    }

    if (this.modoModal() === 'crear') {
      if (!f.username.trim() || f.username.length < 3) {
        this.errorModal.set('El usuario debe tener al menos 3 caracteres.');
        return;
      }
      if (!f.password || f.password.length < 8) {
        this.errorModal.set('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
    }

    this.guardando.set(true);
    this.errorModal.set(null);

    if (this.modoModal() === 'crear') {
      const payload: CreateTrabajadorPayload = {
        username: f.username.trim(),
        password: f.password,
        nombre: f.nombre.trim(),
        apellidos: f.apellidos.trim(),
        email: f.email.trim(),
        telefono: f.telefono.trim() || undefined,
        numeroColegiado: f.numeroColegiado.trim() || undefined,
        especialidad: f.especialidad.trim() || undefined,
        rolId: f.rolId,
      };

      const credencialesAGuardar = {
        username: f.username.trim(),
        password: f.password,
        nombreCompleto: `${f.nombre.trim()} ${f.apellidos.trim()}`,
      };

      this.trabajadorSvc.createTrabajador(payload).subscribe({
        next: (res: any) => {
          this.trabajadores.update((lista) => [res.data, ...lista]);
          this.cerrarModal();
          this.credencialesParaMostrar.set(credencialesAGuardar);
          this.guardando.set(false);
        },
        error: (err: any) => {
          this.errorModal.set(err?.error?.message ?? 'Error al crear el trabajador.');
          this.guardando.set(false);
        },
      });
    } else {
      const id = this.trabajadorEditandoId();
      if (!id) return;

      const payload: UpdateTrabajadorPayload = {
        nombre: f.nombre.trim(),
        apellidos: f.apellidos.trim(),
        email: f.email.trim(),
        telefono: f.telefono.trim() || undefined,
        numeroColegiado: f.numeroColegiado.trim() || undefined,
        especialidad: f.especialidad.trim() || undefined,
        rolId: f.rolId,
      };

      this.trabajadorSvc.updateTrabajador(id, payload).subscribe({
        next: (res: any) => {
          this.trabajadores.update((lista) =>
            lista.map((t) => (t.id === id ? { ...t, ...res.data } : t)),
          );
          this.cerrarModal();
          this.guardando.set(false);
        },
        error: (err: any) => {
          this.errorModal.set(err?.error?.message ?? 'Error al actualizar el trabajador.');
          this.guardando.set(false);
        },
      });
    }
  }

  // ─── Overlay credenciales ──────────────────────────────────────

  cerrarCredenciales() {
    this.credencialesParaMostrar.set(null);
    this.copiado.set(false);
  }

  copiarCredenciales() {
    const c = this.credencialesParaMostrar();
    if (!c) return;
    const texto = `Usuario: ${c.username}\nContraseña: ${c.password}`;
    navigator.clipboard.writeText(texto).then(() => {
      this.copiado.set(true);
      if (this.copiadoTimer) clearTimeout(this.copiadoTimer);
      this.copiadoTimer = setTimeout(() => this.copiado.set(false), 2500);
    });
  }

  ngOnDestroy(): void {
    if (this.copiadoTimer) clearTimeout(this.copiadoTimer);
  }

  // ─── Toggle activo ─────────────────────────────────────────────

  pedirConfirmDesactivar(t: Trabajador, event: Event) {
    event.stopPropagation();
    this.confirmDesactivar.set(t);
  }

  cancelarConfirm() {
    this.confirmDesactivar.set(null);
  }

  confirmarDesactivar() {
    const t = this.confirmDesactivar();
    if (!t) return;
    this.confirmDesactivar.set(null);

    this.trabajadorSvc.desactivarTrabajador(t.id).subscribe({
      next: () => {
        this.trabajadores.update((lista) =>
          lista.map((w) => (w.id === t.id ? { ...w, activo: false } : w)),
        );
      },
    });
  }

  reactivar(t: Trabajador, event: Event) {
    event.stopPropagation();
    this.trabajadorSvc.reactivarTrabajador(t.id).subscribe({
      next: () => {
        this.trabajadores.update((lista) =>
          lista.map((w) => (w.id === t.id ? { ...w, activo: true } : w)),
        );
      },
    });
  }

  // ─── Navegación ────────────────────────────────────────────────

  verFicha(t: Trabajador) {
    this.router.navigate(['/home/trabajadores', t.id]);
  }

  // ─── Filtros ───────────────────────────────────────────────────

  onBusquedaChange(value: string) { this.busqueda.set(value); }
  onFiltroRolChange(value: string) { this.filtroRol.set(value); }
  onFiltroEstadoChange(value: FiltroEstado) { this.filtroEstado.set(value); }

  // ─── Helpers ───────────────────────────────────────────────────

  getInitials(t: Trabajador): string {
    return `${t.nombre?.charAt(0) ?? ''}${t.apellidos?.charAt(0) ?? ''}`.toUpperCase();
  }

  getRolColor(codigo: string | undefined): string {
    const map: Record<string, string> = {
      ADMIN: 'rol-admin',
      TERAPEUTA: 'rol-terapeuta',
      LOGOPEDA: 'rol-logopeda',
      NEUROPSICOLOGIA: 'rol-neuro',
      TERAPIA_OCUPACIONAL: 'rol-to',
      PEDAGOGIA: 'rol-pedagogia',
      RECEPCION: 'rol-recepcion',
    };
    return map[codigo?.toUpperCase() ?? ''] ?? 'rol-default';
  }
}

export default TrabajadoresComponent;

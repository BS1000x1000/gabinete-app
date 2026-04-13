import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TrabajadorService, Trabajador, Rol } from '../../../../../services/trabajadores.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-trabajador-acceso-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trabajador-acceso-tab.component.html',
})
export class TrabajadorAccesoTabComponent implements OnInit, OnDestroy {
  private readonly route         = inject(ActivatedRoute);
  private readonly trabajadorSvc = inject(TrabajadorService);
  readonly auth = inject(AuthService);

  private trabajadorId = '';
  private exitoTimeout: ReturnType<typeof setTimeout> | null = null;

  readonly trabajador    = signal<Trabajador | null>(null);
  readonly roles         = signal<Rol[]>([]);
  readonly isLoading     = signal(true);
  readonly guardandoRol  = signal(false);
  readonly guardandoEstado = signal(false);
  readonly error         = signal<string | null>(null);
  readonly exito         = signal<string | null>(null);
  readonly rolSeleccionado = signal<string>('');

  readonly esPropioUsuario = computed(
    () => this.auth.currentTrabajadorId() === this.trabajadorId,
  );

  ngOnInit(): void {
    this.trabajadorId = this.route.parent?.snapshot.paramMap.get('id') ?? '';
    this.cargar();
  }

  ngOnDestroy(): void {
    if (this.exitoTimeout !== null) clearTimeout(this.exitoTimeout);
  }

  private cargar(): void {
    const cached = this.trabajadorSvc.currentTrabajador();
    if (cached && cached.id === this.trabajadorId) {
      this.trabajador.set(cached);
      this.rolSeleccionado.set(cached.rol?.id ?? '');
    }

    this.trabajadorSvc.getRoles().subscribe({
      next: (res) => {
        this.roles.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  guardarRol(): void {
    const nuevoRolId = this.rolSeleccionado();
    if (!nuevoRolId || nuevoRolId === this.trabajador()?.rol?.id) return;

    this.guardandoRol.set(true);
    this.error.set(null);

    this.trabajadorSvc.updateTrabajador(this.trabajadorId, { rolId: nuevoRolId }).subscribe({
      next: (res) => {
        this.trabajador.set(res.data);
        this.trabajadorSvc.currentTrabajador.set(res.data);
        this.guardandoRol.set(false);
        this.mostrarExito('Rol actualizado correctamente.');
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error al cambiar el rol.');
        this.guardandoRol.set(false);
      },
    });
  }

  toggleEstado(): void {
    const t = this.trabajador();
    if (!t) return;

    this.guardandoEstado.set(true);
    this.error.set(null);

    const op$ = t.activo
      ? this.trabajadorSvc.desactivarTrabajador(this.trabajadorId)
      : this.trabajadorSvc.reactivarTrabajador(this.trabajadorId);

    op$.subscribe({
      next: () => {
        const actualizado = { ...t, activo: !t.activo };
        this.trabajador.set(actualizado);
        this.trabajadorSvc.currentTrabajador.set(actualizado);
        this.guardandoEstado.set(false);
        this.mostrarExito(actualizado.activo ? 'Cuenta activada.' : 'Cuenta desactivada.');
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'Error al cambiar el estado.');
        this.guardandoEstado.set(false);
      },
    });
  }

  private mostrarExito(msg: string): void {
    this.exito.set(msg);
    this.exitoTimeout = setTimeout(() => this.exito.set(null), 3000);
  }
}

export default TrabajadorAccesoTabComponent;

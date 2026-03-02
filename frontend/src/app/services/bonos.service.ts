import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal, computed } from '@angular/core';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Bono, CreateBonoDto, RegistrarPagoDto } from '../interface/bono.interface';

@Injectable({ providedIn: 'root' })
export class BonosService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/bonos`;

  // ── State con signals (preparado para el dashboard del Hito 3) ──
  private _bonosCliente = signal<Bono[]>([]);
  
  readonly bonosCliente    = this._bonosCliente.asReadonly();
  readonly bonoActivo      = computed(() => this._bonosCliente().find(b => b.estado === 'ACTIVO') ?? null);
  readonly historialBonos  = computed(() => this._bonosCliente().filter(b => b.estado !== 'ACTIVO'));
  readonly tieneBonoPendientePago = computed(() =>
    this._bonosCliente().some(b => b.estado === 'CONSUMIDO' && !b.pagado)
  );

  // ── API calls ─────────────────────────────────────────────────
  loadBonosCliente(clienteId: string) {
    return this.http.get<Bono[]>(`${this.apiUrl}/cliente/${clienteId}`).pipe(
      tap(bonos => this._bonosCliente.set(bonos))
    );
  }

  createBono(dto: CreateBonoDto) {
    return this.http.post<Bono>(this.apiUrl, dto).pipe(
      tap(nuevo => this._bonosCliente.update(bonos => [nuevo, ...bonos]))
    );
  }

  registrarPago(bonoId: string, dto: RegistrarPagoDto) {
    return this.http.patch<Bono>(`${this.apiUrl}/${bonoId}/registrar-pago`, dto).pipe(
      tap(actualizado => this._actualizarEnLista(actualizado))
    );
  }

  cancelarBono(bonoId: string) {
    return this.http.patch<Bono>(`${this.apiUrl}/${bonoId}/cancelar`, {}).pipe(
      tap(actualizado => this._actualizarEnLista(actualizado))
    );
  }

  getCobrosPendientes() {
    return this.http.get<Bono[]>(`${this.apiUrl}/cobros-pendientes`);
  }

  private _actualizarEnLista(actualizado: Bono) {
    this._bonosCliente.update(bonos =>
      bonos.map(b => b.id === actualizado.id ? actualizado : b)
    );
  }
}
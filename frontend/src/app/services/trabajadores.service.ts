import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { TipoSesion } from '../interface/sesion.interface';

export interface Trabajador {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  username?: string;
  telefono?: string;
  numeroColegiado?: string;
  colegioProfesional?: string;
  numeroPoliza?: string;
  direccionProfesional?: string;
  especialidad?: string;
  fechaContratacion?: string;
  urlVideollamada?: string;
  // Datos fiscales del autónomo (Hito R)
  nifFiscal?: string;
  nombreFiscal?: string;
  direccionFiscal?: string;
  codigoPostalFiscal?: string;
  ciudadFiscal?: string;
  provinciaFiscal?: string;
  iban?: string;
  retencionIrpf?: number;
  emailFacturacion?: string;
  rol: {
    id: string;
    nombreRol: string;
    codigo?: string;
  };
  activo: boolean;
}

export interface Rol {
  id: string;
  nombreRol: string;
  codigo: string;
  descripcion?: string;
}

export interface CreateTrabajadorPayload {
  username: string;
  password: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  numeroColegiado?: string;
  colegioProfesional?: string;
  numeroPoliza?: string;
  direccionProfesional?: string;
  especialidad?: string;
  rolId: string;
}

export interface UpdateTrabajadorPayload {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  numeroColegiado?: string;
  colegioProfesional?: string;
  numeroPoliza?: string;
  direccionProfesional?: string;
  especialidad?: string;
  fechaContratacion?: string;
  rolId?: string;
  urlVideollamada?: string | null;
}

export interface UpdateMePayload {
  urlVideollamada?: string | null;
}

export interface ClienteAsignado {
  id: string;
  nombre: string;
  apellidos: string;
  tipoTerapia: TipoSesion;
  activo: boolean;
  /** `diaSemana` es un Int con la convención 0=Dom..6=Sáb, NO la ISO 1..7. */
  horarios?: { diaSemana: number; horaInicio: string; horaFin: string }[];
}

interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class TrabajadorService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/trabajadores`;
  private rolesApi = `${environment.apiUrl}/roles`;

  trabajadores = signal<Trabajador[]>([]);
  currentTrabajador = signal<Trabajador | null>(null);

  getTrabajadores(incluirInactivos = false) {
    const params = incluirInactivos ? '?incluirInactivos=true' : '';
    return this.http
      .get<WrappedResponse<Trabajador[]>>(`${this.api}${params}`)
      .pipe(
        tap((res) => {
          this.trabajadores.set(res.data || []);
        }),
        catchError((err) => {
          console.error('Error al cargar trabajadores:', err);
          return of({ success: false, data: [], timestamp: new Date().toISOString() });
        }),
      );
  }

  getRoles() {
    return this.http.get<WrappedResponse<Rol[]>>(this.rolesApi).pipe(
      catchError((err) => {
        console.error('Error al cargar roles:', err);
        return of({ success: false, data: [], timestamp: new Date().toISOString() });
      }),
    );
  }

  createTrabajador(payload: CreateTrabajadorPayload) {
    return this.http.post<WrappedResponse<Trabajador>>(this.api, payload);
  }

  updateTrabajador(id: string, payload: UpdateTrabajadorPayload) {
    return this.http.patch<WrappedResponse<Trabajador>>(`${this.api}/${id}`, payload);
  }


  desactivarTrabajador(id: string) {
    return this.http.delete<WrappedResponse<any>>(`${this.api}/${id}`);
  }

  reactivarTrabajador(id: string) {
    return this.http.patch<WrappedResponse<Trabajador>>(`${this.api}/${id}/reactivar`, {});
  }

  getTrabajador(id: string) {
    return this.http.get<WrappedResponse<Trabajador>>(`${this.api}/${id}`);
  }

  getClientesAsignados(id: string) {
    return this.http.get<WrappedResponse<ClienteAsignado[]>>(`${this.api}/${id}/clientes`);
  }

  /**
   * Perfil propio. `PATCH /trabajadores/:id` es ADMIN-only, asi que un clinico
   * en su propia ficha veia el boton "Editar" y se comia un 403 al guardar.
   * Este metodo existia y no lo llamaba ningun componente.
   */
  updateMe(payload: UpdateMePayload) {
    return this.http.patch<WrappedResponse<Trabajador>>(`${this.api}/me`, payload);
  }

  updateDatosFiscales(payload: {
    nifFiscal?: string;
    nombreFiscal?: string;
    direccionFiscal?: string;
    codigoPostalFiscal?: string;
    ciudadFiscal?: string;
    provinciaFiscal?: string;
    iban?: string;
    retencionIrpf?: number;
    emailFacturacion?: string;
  }) {
    return this.http.patch<WrappedResponse<Trabajador>>(`${this.api}/me/datos-fiscales`, payload);
  }

  getMe() {
    return this.http.get<WrappedResponse<Trabajador>>(`${this.api}/me`);
  }

  /** Cambia la contraseña del trabajador autenticado (verifica contraseña actual) */
  cambiarPasswordPropio(passwordActual: string, passwordNueva: string) {
    return this.http.patch<WrappedResponse<{ message: string }>>(`${this.api}/me/cambiar-password`, {
      passwordActual,
      passwordNueva,
    });
  }

  /** Cambia la contraseña de cualquier trabajador sin verificar la actual (solo ADMIN) */
  cambiarPassword(id: string, passwordActual: string, passwordNueva: string) {
    return this.http.patch<WrappedResponse<{ message: string }>>(`${this.api}/${id}/cambiar-password`, {
      passwordActual,
      passwordNueva,
    });
  }

  /** Actualiza datos fiscales de un trabajador concreto (self o ADMIN) */
  updateDatosFiscalesDe(id: string, payload: {
    nifFiscal?: string;
    nombreFiscal?: string;
    direccionFiscal?: string;
    codigoPostalFiscal?: string;
    ciudadFiscal?: string;
    provinciaFiscal?: string;
    iban?: string;
    retencionIrpf?: number;
    emailFacturacion?: string;
  }) {
    return this.http.patch<WrappedResponse<Trabajador>>(`${this.api}/${id}/datos-fiscales`, payload);
  }

  asignarCliente(trabajadorId: string, clienteId: string, tipoTerapia: TipoSesion) {
    return this.http.post<WrappedResponse<any>>(
      `${this.api}/${trabajadorId}/clientes/${clienteId}`,
      { tipoTerapia },
    );
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import {
  ContactosData,
  ColegioData,
  SanitarioData,
  ClienteData,
} from '../interface/cliente-frontend.interface';
import { ClienteDataBackend } from '../interface/cliente-backend.interface';
import { 
  ClienteObjetivosResponse,
  EstadisticasObjetivos,
  AsignarObjetivosDto 
} from '../interface/objetivo-general.interface';
import { calcularEdad } from '../shared/utils/date';

// ✅ NUEVO: Interface para respuestas envueltas
interface WrappedResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/clientes`;

  // Signals (Estado Centralizado)
  cliente = signal<ClienteData | null>(null);
  contactos = signal<ContactosData | null>(null);
  colegio = signal<ColegioData | null>(null);
  sanitario = signal<SanitarioData | null>(null);
  objetivos = signal<ClienteObjetivosResponse | null>(null);
  estadisticasObjetivos = signal<EstadisticasObjetivos | null>(null);
  contactosFamiliares = signal<any[]>([]);

  // ========================================
  // CRUD BÁSICO
  // ========================================

  /**
   * Obtener todos los clientes
   */
  getAll(): Observable<ClienteDataBackend[]> {
    return this.http
      .get<WrappedResponse<ClienteDataBackend[]>>(this.api)
      .pipe(map((res) => res.data || res));
  }

  /**
   * Obtener un cliente por ID
   */
  getById(id: string): Observable<ClienteDataBackend> {
    return this.http
      .get<WrappedResponse<ClienteDataBackend>>(`${this.api}/${id}`)
      .pipe(map((res) => res.data || res));
  }

  /**
   * Carga todos los datos del cliente y actualiza los signals
   */
  loadAll(clienteId: string): Observable<void> {
    return this.http
      .get<WrappedResponse<ClienteDataBackend>>(`${this.api}/${clienteId}`)
      .pipe(
        map((res) => res.data || res), // ✅ Extraer data
        tap((c) => {
          const familiarData = c.contactosFamiliares?.[0] || null;
          const colegioData = c.colegio || null;
          const sanitarioData = c.sanitario || null;
          this.contactosFamiliares.set(c.contactosFamiliares || []);

          console.log('📦 Cliente cargado:', c);

          // Actualizar signal principal (cliente)
          this.cliente.set({
            nombre: c.nombre,
            apellidos: c.apellidos,
            edad: calcularEdad(new Date(c.fechaNacimiento)),
            fechaNacimiento: new Date(c.fechaNacimiento),
            domicilio: c.domicilio,
            dni: c.dni,
            ciudad: c.ciudad,
            provincia: c.provincia,
            fechaAlta: new Date(c.fechaAlta),
            fechaInicio: c.fechaInicio ? new Date(c.fechaInicio) : new Date(),
            autorizaDatosPersonales: true,
            autorizaDatosImagen: true,
            objetivosResumen: {
              total: c.objetivosGeneralesAsignados?.length || 0,
              activos: c.objetivosGeneralesAsignados?.filter(o => o.activo).length || 0
            }
          });

          // Actualizar contactos
          if (familiarData) {
            this.contactos.set({
              nombrePadre: familiarData.nombre,
              dniPadre: familiarData.dni,
              emailPadre: familiarData.email,
              telefonoPadre: familiarData.telefono ? Number(familiarData.telefono) : undefined,
              nombreMadre: undefined,
              dniMadre: undefined,
              emailMadre: undefined,
              telefonoMadre: undefined,
            } as ContactosData);
          } else {
            this.contactos.set(null);
          }

          // Actualizar colegio
          if (colegioData) {
            this.colegio.set({
              nombreDelCentro: colegioData.nombre,
              cursoEscolar: c.curso,
              direccionColegio: colegioData.direccionColegio,
              ctoColegioUno: colegioData.ctoColegioUno,
              ctoTelefonoUno: colegioData.ctoTelefonoUno,
              ctoEmailColegioUno: colegioData.ctoEmailColegioUno,
              ctoRelacionColegioUno: colegioData.ctoRelacionColegioUno,
              ctoColegioDos: colegioData.ctoColegioDos,
              ctoTelefonoDos: colegioData.ctoTelefonoDos,
              ctoRelacionColegioDos: colegioData.ctoRelacionColegioDos || '',
              ctoEmailColegioDos: colegioData.ctoEmailColegioDos,
            } as ColegioData);
          } else {
            this.colegio.set(null);
          }

          // Actualizar sanitario
          if (sanitarioData) {
            this.sanitario.set({
              centroSalud: sanitarioData.centroSalud || '',
              alergias: sanitarioData.alergias,
              medicacion: sanitarioData.medicacion,
              diagnostico: sanitarioData.diagnostico,
              especialistas: sanitarioData.especialistas,
              tratamientos: sanitarioData.tratamientos,
              adaptaciones: sanitarioData.adaptaciones,
              tipoAdaptaciones: sanitarioData.tipoAdaptaciones,
              apoyos: sanitarioData.apoyos,
            } as SanitarioData);
          } else {
            this.sanitario.set(null);
          }
        }),
        map(() => {})
      );
  }

  // ========================================
  // GESTIÓN DE OBJETIVOS GENERALES
  // ========================================

  /**
   * Obtener objetivos generales del cliente con estadísticas
   */
  getObjetivosCliente(clienteId: string): Observable<ClienteObjetivosResponse> {
    return this.http
      .get<WrappedResponse<ClienteObjetivosResponse>>(`${this.api}/${clienteId}/objetivos-generales`)
      .pipe(
        map((res) => res.data || res),
        tap((res) => {
          this.objetivos.set(res);
          console.log('🎯 Objetivos del cliente cargados:', res.objetivos.length);
        })
      );
  }

  /**
   * Asignar objetivos generales a un cliente
   */
  asignarObjetivos(clienteId: string, dto: AsignarObjetivosDto): Observable<any> {
    return this.http
      .post<WrappedResponse<any>>(`${this.api}/${clienteId}/objetivos-generales`, dto)
      .pipe(
        map((res) => res.data || res),
        tap((res) => {
          console.log('✅ Objetivos asignados:', res);
          this.getObjetivosCliente(clienteId).subscribe();
        })
      );
  }

  /**
   * Desasignar un objetivo general del cliente
   */
  desasignarObjetivo(clienteId: string, objetivoGeneralId: string): Observable<any> {
    return this.http
      .delete<WrappedResponse<any>>(`${this.api}/${clienteId}/objetivos-generales/${objetivoGeneralId}`)
      .pipe(
        map((res) => res.data || res),
        tap(() => {
          console.log('❌ Objetivo desasignado');
          this.getObjetivosCliente(clienteId).subscribe();
        })
      );
  }

  /**
   * Obtener estadísticas de objetivos del cliente
   */
  getEstadisticasObjetivos(clienteId: string): Observable<EstadisticasObjetivos> {
    return this.http
      .get<WrappedResponse<EstadisticasObjetivos>>(`${this.api}/${clienteId}/objetivos-generales/estadisticas`)
      .pipe(
        map((res) => res.data || res),
        tap((res) => {
          this.estadisticasObjetivos.set(res);
          console.log('📊 Estadísticas de objetivos cargadas');
        })
      );
  }

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Limpiar todos los signals
   */
  clearCliente(): void {
    this.cliente.set(null);
    this.contactos.set(null);
    this.colegio.set(null);
    this.sanitario.set(null);
    this.objetivos.set(null);
    this.estadisticasObjetivos.set(null);
  }
}
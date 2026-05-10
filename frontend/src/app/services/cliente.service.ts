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
import { ClienteDataBackend, ConsentimientoRgpdBackend } from '../interface/cliente-backend.interface';
import {
  ClienteObjetivosResponse,
  EstadisticasObjetivos,
  AsignarObjetivosDto,
} from '../interface/objetivo-general.interface';
import { calcularEdad, calcularEdadTexto } from '../shared/utils/date';
import { VerificacionDniResponse } from '../interface/verificacion-dni.interface';
import { triggerDownload } from '../shared/utils/download.utils';

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
  clienteRaw = signal<ClienteDataBackend | null>(null);
  contactosFamiliares = signal<any[]>([]);

  // ========================================
  // CRUD BÁSICO
  // ========================================

  create(clienteData: any): Observable<any> {
    return this.http
      .post<WrappedResponse<any>>(`${this.api}`, clienteData)
      .pipe(
        map((res) => res.data || res),
        tap(() => {}),
      );
  }

  /**
   * Actualizar campos parciales de un cliente
   * PATCH /api/clientes/:id
   */
  updateCliente(id: string, data: Partial<any>): Observable<any> {
    return this.http
      .patch<WrappedResponse<any>>(`${this.api}/${id}`, data)
      .pipe(
        map((res) => res.data || res),
        tap(() => {}),
      );
  }

  /**
   * Obtener todos los clientes
   */
  getAll(): Observable<ClienteDataBackend[]> {
    return this.http
      .get<any>(`${this.api}?limit=500`)
      .pipe(map((res: any) => res?.data?.data ?? res?.data ?? res));
  }

  getMisClientes(): Observable<ClienteDataBackend[]> {
    return this.http
      .get<WrappedResponse<ClienteDataBackend[]>>(`${this.api}/mis-clientes`)
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
          this.clienteRaw.set(c);
          const familiarData = c.contactosFamiliares?.[0] || null;
          const colegioData = c.colegio || null;
          const sanitarioData = c.sanitario || null;
          this.contactosFamiliares.set(c.contactosFamiliares || []);

          // Actualizar signal principal (cliente)
          this.cliente.set({
            nombre: c.nombre,
            apellidos: c.apellidos,
            edad: calcularEdad(new Date(c.fechaNacimiento)),
            edadTexto: calcularEdadTexto(new Date(c.fechaNacimiento)).texto,
            fechaNacimiento: new Date(c.fechaNacimiento),
            domicilio: c.domicilio,
            curso: c.curso,
            dni: c.dni,
            ciudad: c.ciudad,
            provincia: c.provincia,
            fechaAlta: new Date(c.fechaAlta),
            fechaInicio: c.fechaInicio ? new Date(c.fechaInicio) : new Date(),
            autorizaDatosPersonales: c.consentimientoRgpd ?? false,
            autorizaDatosImagen: c.consentimientoRgpd ?? false,
            objetivosResumen: {
              total: c.objetivosGeneralesAsignados?.length || 0,
              activos:
                c.objetivosGeneralesAsignados?.filter((o) => o.activo).length ||
                0,
            },
          });

          // Actualizar contactos
          if (familiarData) {
            this.contactos.set({
              nombrePadre: familiarData.nombre,
              dniPadre: familiarData.dni,
              emailPadre: familiarData.email,
              telefonoPadre: familiarData.telefono
                ? Number(familiarData.telefono)
                : undefined,
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
        map(() => {}),
      );
  }

  // ── FAMILIAR ──────────────────────────────────────────────
  crearFamiliar(clienteId: string, data: any): Observable<any> {
    return this.http
      .post<WrappedResponse<any>>(`${this.api}/${clienteId}/familiares`, data)
      .pipe(map((res) => res.data || res));
  }

  updateFamiliar(
    clienteId: string,
    familiarId: string,
    data: any,
  ): Observable<any> {
    return this.http
      .patch<
        WrappedResponse<any>
      >(`${this.api}/${clienteId}/familiares/${familiarId}`, data)
      .pipe(map((res) => res.data || res));
  }

  eliminarFamiliar(clienteId: string, familiarId: string): Observable<any> {
    return this.http
      .delete<
        WrappedResponse<any>
      >(`${this.api}/${clienteId}/familiares/${familiarId}`)
      .pipe(map((res) => res.data || res));
  }

  // ── DATOS PAGADOR (FACTURACIÓN) ──────────────────────────
  updateDatosPagador(clienteId: string, data: {
    nifTutorPagador?: string;
    nombreTutorPagador?: string;
    direccionFiscalTutor?: string;
    codigoPostalTutor?: string;
    ciudadTutor?: string;
    emailFacturacion?: string;
  }): Observable<any> {
    return this.http
      .patch<WrappedResponse<any>>(`${this.api}/${clienteId}/datos-pagador`, data)
      .pipe(map((res) => res.data || res));
  }

  // ── SANITARIO ─────────────────────────────────────────────
  updateSanitario(clienteId: string, data: any): Observable<any> {
    return this.http
      .patch<WrappedResponse<any>>(`${this.api}/${clienteId}/sanitario`, data)
      .pipe(map((res) => res.data || res));
  }

  // ── COLEGIO ───────────────────────────────────────────────
  updateColegio(clienteId: string, data: any): Observable<any> {
    return this.http
      .patch<WrappedResponse<any>>(`${this.api}/${clienteId}/colegio`, data)
      .pipe(map((res) => res.data || res));
  }

  // ========================================
  // GESTIÓN DE OBJETIVOS GENERALES
  // ========================================

  /**
   * Obtener objetivos generales del cliente con estadísticas
   */
  getObjetivosCliente(clienteId: string): Observable<ClienteObjetivosResponse> {
    return this.http
      .get<
        WrappedResponse<ClienteObjetivosResponse>
      >(`${this.api}/${clienteId}/objetivos-generales`)
      .pipe(
        map((res) => res.data || res),
        tap((res) => {
          this.objetivos.set(res);
        }),
      );
  }

  /**
   * Asignar objetivos generales a un cliente
   */
  asignarObjetivos(
    clienteId: string,
    dto: AsignarObjetivosDto,
  ): Observable<any> {
    return this.http
      .post<
        WrappedResponse<any>
      >(`${this.api}/${clienteId}/objetivos-generales`, dto)
      .pipe(
        map((res) => res.data || res),
        tap(() => {
          this.getObjetivosCliente(clienteId).subscribe();
        }),
      );
  }

  /**
   * Desasignar un objetivo general del cliente
   */
  desasignarObjetivo(
    clienteId: string,
    objetivoGeneralId: string,
  ): Observable<any> {
    return this.http
      .delete<
        WrappedResponse<any>
      >(`${this.api}/${clienteId}/objetivos-generales/${objetivoGeneralId}`)
      .pipe(
        map((res) => res.data || res),
        tap(() => {
          this.getObjetivosCliente(clienteId).subscribe();
        }),
      );
  }

  /**
   * Obtener estadísticas de objetivos del cliente
   */
  getEstadisticasObjetivos(
    clienteId: string,
  ): Observable<EstadisticasObjetivos> {
    return this.http
      .get<
        WrappedResponse<EstadisticasObjetivos>
      >(`${this.api}/${clienteId}/objetivos-generales/estadisticas`)
      .pipe(
        map((res) => res.data || res),
        tap((res) => {
          this.estadisticasObjetivos.set(res);
        }),
      );
  }

  /**
   * Verificar si un DNI está disponible
   */
  verificarDniDisponible(dni: string): Observable<VerificacionDniResponse> {
    return this.http
      .get<WrappedResponse<VerificacionDniResponse>>(
        `${this.api}/verificar-dni/${dni}`,
      ) // ✅ Agregar WrappedResponse
      .pipe(
        map((res) => res.data || res), // ✅ Desempaquetar como los demás endpoints
        tap(() => {}),
      );
  }

  // ========================================
  // TERAPEUTAS
  // ========================================

  /**
   * Asignar un nuevo terapeuta a un cliente
   * POST /api/clientes/:clienteId/asignar-trabajador
   */
  asignarTrabajador(
    clienteId: string,
    body: {
      trabajadorId: string;
      tipoTerapia: string;
      horarios: { diaSemana: number; horaInicio: string; horaFin: string }[];
    },
  ): Observable<any> {
    return this.http
      .post<
        WrappedResponse<any>
      >(`${this.api}/${clienteId}/asignar-trabajador`, body)
      .pipe(
        map((res) => res.data || res),
        tap(() => {}),
      );
  }

  /**
   * Reemplazar los horarios de una asignación cliente-trabajador
   * PATCH /api/clientes/:clienteId/asignaciones/:asignacionId/horarios
   */
  actualizarHorarios(
    clienteId: string,
    asignacionId: string,
    horarios: { diaSemana: number; horaInicio: string; horaFin: string }[],
    confirmar: boolean = false,
  ): Observable<any> {
    return this.http
      .patch<
        WrappedResponse<any>
      >(`${this.api}/${clienteId}/asignaciones/${asignacionId}/horarios`, { horarios, confirmarActualizacionSesiones: confirmar })
      .pipe(map((res) => res.data || res));
  }

  /**
   * Desasignar un trabajador de un cliente por ID de asignación
   */
  desasignarTrabajador(
    clienteId: string,
    asignacionId: string,
  ): Observable<any> {
    return this.http
      .delete<
        WrappedResponse<any>
      >(`${this.api}/${clienteId}/asignaciones/${asignacionId}`)
      .pipe(
        map((res) => res.data || res),
        tap(() => {}),
      );
  }

  // ========================================
  // RGPD — EXPORTACIÓN DE DATOS (Art. 20)
  // ========================================

  exportarDatos(clienteId: string, nombreCliente: string): Observable<void> {
    return this.http
      .get<WrappedResponse<any>>(`${this.api}/${clienteId}/export`)
      .pipe(
        map((res) => res.data ?? res),
        tap((data) => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const fecha = new Date().toISOString().slice(0, 10);
          const nombre = nombreCliente.replace(/\s+/g, '_').toLowerCase();
          triggerDownload(blob, `exportacion_rgpd_${nombre}_${fecha}.json`);
        }),
        map(() => void 0),
      );
  }

  // ========================================
  // RGPD — CONSENTIMIENTO
  // ========================================

  registrarConsentimiento(
    clienteId: string,
    dto: { familiarId: string; aceptado: boolean; versionTexto: string; textoConsentimiento: string },
  ): Observable<ConsentimientoRgpdBackend> {
    return this.http
      .post<WrappedResponse<ConsentimientoRgpdBackend>>(`${this.api}/${clienteId}/consentimiento`, dto)
      .pipe(map((res) => res.data ?? (res as any)));
  }

  getHistoricoConsentimientos(clienteId: string): Observable<ConsentimientoRgpdBackend[]> {
    return this.http
      .get<WrappedResponse<ConsentimientoRgpdBackend[]>>(`${this.api}/${clienteId}/consentimientos`)
      .pipe(map((res) => res.data ?? (res as any)));
  }

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Limpiar todos los signals
   */
  clearCliente(): void {
    this.cliente.set(null);
    this.clienteRaw.set(null);
    this.contactos.set(null);
    this.colegio.set(null);
    this.sanitario.set(null);
    this.objetivos.set(null);
    this.estadisticasObjetivos.set(null);
  }
}

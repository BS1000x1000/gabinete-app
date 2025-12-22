/* Servicio para manejar la lógica de estado y la comunicación con la API */
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import {
  ContactosData,
  ColegioData,
  SanitarioData,
  ClienteData,
} from '../../interface/cliente-frontend.interface';
import { ClienteDataBackend } from '../../interface/cliente-backend.interface'; // Usaremos la estructura tipada correcta
import { calcularEdad } from '../utils/date';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private http = inject(HttpClient);
  private api = 'http://localhost:3000'; // URL base de tu backend

  // Signals (Estado Centralizado)
  cliente = signal<ClienteData | null>(null);
  contactos = signal<ContactosData | null>(null);
  colegio = signal<ColegioData | null>(null);
  sanitario = signal<SanitarioData | null>(null);
  
  /**
   * Carga todos los datos del cliente desde un único endpoint.
   * Luego, descompone la respuesta y actualiza todos los Signals.
   */
  loadAll(clienteId: string): Observable<void> {
    return this.http
      .get<ClienteDataBackend>(`${this.api}/clientes/${clienteId}`)
      .pipe(
        tap((c) => {
          
          // --- 1. Extracción y Preparación de Datos Anidados ---
          // Accedemos al primer elemento del array de contactos (si existe)
          const familiarData = c.contactosFamiliares.length > 0 ? c.contactosFamiliares[0] : null;
          // Accedemos al objeto colegio anidado
          const colegioData = c.colegio || null; 
          // Asumimos que Sanitario viene en un array y tomamos el primer elemento (si existe)
          // **NOTA:** Ajusta esta línea si Sanitario viene como un objeto simple 'c.sanitario'
          const sanitarioData = c.sanitario && c.sanitario.length > 0 ? c.sanitario[0] : null;
          console.log(c);
          // --- 2. Actualizar el Signal principal (cliente) ---
          this.cliente.set({
            nombre: c.nombre,
            apellidos: c.apellidos,
            edad: calcularEdad(c.fechaNacimiento),
            fechaNacimiento: c.fechaNacimiento,
            domicilio: c.domicilio,
            numeroDeSesiones: c.numeroDeSesiones,
            dni: c.dni,
            ciudad: c.ciudad,
            provincia: c.provincia,
            fechaAlta: c.fechaAlta,
            // Usamos la fecha real del backend o null/undefined si es el caso
            fechaInicio: c.fechaInicio || new Date(), 
            autorizaDatosPersonales: true,
            autorizaDatosImagen: true,
          });

          // --- 3. Actualizar los Signals auxiliares con la data descompuesta ---

          // ** Contactos **
          if (familiarData) {
            this.contactos.set({
              // Leemos desde el objeto anidado 'familiarData'
              nombrePadre: familiarData.nombrePadre,
              dniPadre: familiarData.dniPadre,
              emailPadre: familiarData.emailPadre,
              // Convertimos el número de teléfono si es necesario
              telefonoPadre: familiarData.telefonoPadre ? Number(familiarData.telefonoPadre) : undefined,
              nombreMadre: familiarData.nombreMadre,
              dniMadre: familiarData.dniMadre,
              emailMadre: familiarData.emailMadre,
              telefonoMadre: familiarData.telefonoMadre ? Number(familiarData.telefonoMadre) : undefined,
              
              // Estos campos (otroContacto) no estaban en tu JSON de ejemplo, 
              // por lo que los dejamos en 'undefined' o 'null'
              otroContactoNombre: undefined,
              otroContactoEmail: undefined,
              otroContactoTelefono: undefined,
            } as ContactosData);
          } else {
            this.contactos.set(null);
          }

          // ** Colegio **
          if (colegioData) {
            this.colegio.set({
              // El nombre del centro está en la relación anidada
              nombreDelCentro: colegioData.nombre,
              // cursoEscolar viene del campo 'curso' en la raíz del cliente
              cursoEscolar: c.curso, 
              direccionColegio: colegioData.direccionColegio,
              // Los contactos del colegio vienen del objeto anidado 'colegioData'
              ctoColegioUno: colegioData.ctoColegioUno, // Asumo que usas la relación como contacto principal 1
              ctoTelefonoUno: colegioData.ctoTelefonoUno,
              ctoEmailColegioUno: colegioData.ctoEmailColegioUno,
              ctoRelacionColegioUno: colegioData.ctoRelacionColegioUno, // Relación
              ctoColegioDos: colegioData.ctoColegioDos, // Asumo que usas la relación como contacto principal 2
              ctoTelefonoDos: colegioData.ctoTelefonoDos,
              ctoRelacionColegioDos: colegioData.ctoRelacionColegioDos, // Relación
              ctoEmailColegioDos: colegioData.ctoEmailColegioDos,
            } as ColegioData);
          } else {
            this.colegio.set(null);
          }

          // ** Sanitario/Médico **
          if (sanitarioData) {
            this.sanitario.set({
              // Leemos desde el objeto anidado 'sanitarioData'
              centroSalud: sanitarioData.centroSalud,
              alergias: sanitarioData.alergias,
              medicacion: sanitarioData.medicacion,
              diagnostico: sanitarioData.diagnostico,
              especialistas: sanitarioData.especialistas,
              tratamientos: sanitarioData.tratamientos,
              adaptaciones: sanitarioData.adaptaciones,
              tipoAdaptaciones: sanitarioData.tipoAdaptaciones,
            } as SanitarioData);
          } else {
            this.sanitario.set(null);
          }
        }),
        // Usamos map para asegurar que el tipo de retorno final sea Observable<void>
        map(() => {})
      );
  }

  /**
   * Limpia todos los Signals al salir del ListadoComponent.
   */
  clearCliente(): void {
    this.cliente.set(null);
    this.contactos.set(null);
    this.colegio.set(null);
    this.sanitario.set(null);
  }
}
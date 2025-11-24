import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { N8nService } from '../n8n/n8n.service'; 
import { N8nClienteOnboardingPayload } from 'src/n8n/interface/n8n-cliente.interface';
import { CreateClienteDto } from './dto/clientedto-interface';
import { prisma } from 'src/lib/prisma';


@Injectable()
export class ClientesService {
  constructor(
    private n8nService: N8nService, // Inyección del servicio de n8n
  ) {}

  /**
   * Crea un nuevo cliente, realiza un upsert del colegio asociado,
   * crea un contacto familiar y dispara el flujo de onboarding en n8n.
   * @param data DTO con los datos del nuevo cliente.
   * @returns El objeto Cliente recién creado por Prisma.
   */
  async create(data: CreateClienteDto): Promise<any> {
    try {
      // 1. Lógica de Upsert para el Colegio (crear o actualizar si ya existe)
      let colegioExistente: any = null;
      if (data.nombreDelCentro) {
        colegioExistente = await prisma.colegio.upsert({
          where: { nombre: data.nombreDelCentro },
          update: {
            direccionColegio: data.direccionColegio, 
            ctoColegioUno: data.ctoEmailColegioUno,
            relacionCtoColegioUno: data.ctoEmailColegioUno,
            ctoEmailColegioDos: data.ctoEmailColegioUno,
            relacionCtoColegioDos: data.ctoEmailColegioUno,
          },
          create: {
            nombre: data.nombreDelCentro,
            direccionColegio: data.direccionColegio, 
          },
        });
      }

      // 2. Crear el Cliente y el Contacto Familiar en una sola transacción anidada
      const nuevoCliente = await prisma.cliente.create({
        data: {
          nombre: data.nombre,
          apellidos: data.apellidos,
          fechaNacimiento: data.fechaNacimiento, 
          alergias: data.alergias,
          activo: true, 
          
          domicilio: data.domicilio, 
          curso: data.cursoEscolar, 
          diagnostico: data.diagnostico ?? "",
          tratamientos: data.otrosTratamientos ?? "", 
          medicacion: data.medicacion ?? "", 

          // Campos booleanos basados en la presencia de datos
          adaptaciones: data.tipoAdaptaciones ? true : false, 
          apoyos: data.numeroDeSesiones && data.numeroDeSesiones.length > 0 ? true : false, 

          // Conecta el colegio si se creó o encontró
          colegio: colegioExistente ? { connect: { id: colegioExistente.id } } : undefined,

          // Creación anidada del contacto familiar (asumo que es una relación 1:N)
          contactosFamiliares: {
            create: {
              nombreContacto: data.nombreMadre || data.nombrePadre || data.otroContactoNombre || 'Contacto Principal', 
              parentesco: 'Contacto Principal', 
              
              emailPadre: data.emailPadre,
              telefonoPadre: data.telefonoPadre ? String(data.telefonoPadre) : undefined,
              
              emailMadre: data.emailMadre,
              telefonoMadre: data.telefonoMadre ? String(data.telefonoMadre) : undefined,
              
              telefonoWhatsapp: String(data.telefonoMadre) || String(data.telefonoPadre) || String(data.otroContactoTelefono),
            }
          },
        },
        // Incluir la información de relaciones para el payload de n8n
        include: {
            colegio: true, 
            contactosFamiliares: true, 
        }
      });
      
      // 3. Preparación del Payload para n8n
      const contacto = nuevoCliente.contactosFamiliares[0] || {} as any;
      const colegioInfo: any = nuevoCliente.colegio;

      const n8nPayload: N8nClienteOnboardingPayload = {
        id_cliente_interno: nuevoCliente.id, 
        
        Nombre: nuevoCliente.nombre,
        Apellidos: nuevoCliente.apellidos,
        "Fecha de nacimiento": nuevoCliente.fechaNacimiento!.toISOString().split('T')[0], 
        Domicilio: nuevoCliente.domicilio, 

        "Nombre del padre": data.nombrePadre, 
        "Email padre": contacto.emailPadre ?? "",
        "Telefono padre": contacto.telefonoPadre ? Number(contacto.telefonoPadre) : undefined, 
        "Nombre madre": data.nombreMadre, 
        "Email madre": contacto.emailMadre ?? "",
        "Telefono madre": contacto.telefonoMadre ? Number(contacto.telefonoMadre) : undefined,
        "Otro contacto nombre": data.otroContactoNombre, 
        "Otro contacto email": data.otroContactoEmail, 
        "Otro contacto telefono": data.otroContactoTelefono,

        "Curso escolar": nuevoCliente.curso, 
        "Nombre del centro": colegioInfo ? colegioInfo.nombre : data.nombreDelCentro,
        "Dirección colegio": colegioInfo ? colegioInfo.direccionColegio : data.direccionColegio, 
        
        Adaptaciones: data.adaptaciones, 
        "Tipo adaptaciones": data.tipoAdaptaciones, 
        Diagnóstico: nuevoCliente.diagnostico,
        "Otros tratamientos": nuevoCliente.tratamientos, 
        Medicación: nuevoCliente.medicacion,
        Alergias: nuevoCliente.alergias ?? "No", 
        "Numero de sesiones": data.numeroDeSesiones, 

        "Contacto Colegio 1": data.ctoColegioUno, 
        "Relacion contacto colegio 1": data.relacionCtoColegioUno,
        "Email contacto colegio 1": data.ctoEmailColegioUno,
        "Contacto Colegio 2": data.ctoColegioDos,
        "Relacion contacto 2": data.relacionCtoColegioDos,
        "Email contacto colegio 2": data.ctoEmailColegioDos,
      };

      // 4. Llamada al servicio de n8n
      await this.n8nService.iniciarOnboarding(n8nPayload);

      return nuevoCliente;

    } catch (error) {
      // 5. Manejo y relanzamiento de excepciones
      if (error) {
        // Loguear el error de Prisma
        console.error('Prisma Error:', error.code, error.message);
        throw new InternalServerErrorException(`Error de base de datos (Prisma): ${error.message}`);
      }
      // Relanzar cualquier otra excepción
      throw new InternalServerErrorException(`Fallo general en la creación del cliente: ${error.message}`);
    }
  }
}
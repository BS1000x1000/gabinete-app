import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { N8nService } from '../n8n/n8n.service'; 
import { Prisma } from '@prisma/client';
import { CreateClienteDto } from './dto/create-cliente.dto'; 
import { N8nClienteOnboardingPayload } from '../n8n/n8n-payload.interface';


@Injectable()
export class ClientesService {
  constructor(
    private prisma: PrismaService, // Inyección del servicio de Prisma
    private n8nService: N8nService, // Inyección del servicio de n8n
  ) {}

  /**
   * Crea un nuevo cliente, realiza un upsert del colegio asociado,
   * crea un contacto familiar y dispara el flujo de onboarding en n8n.
   * @param data DTO con los datos del nuevo cliente.
   * @returns El objeto Cliente recién creado por Prisma.
   */
  async create(data: CreateClienteDto): Promise<Prisma.Cliente> {
    try {
      // 1. Lógica de Upsert para el Colegio (crear o actualizar si ya existe)
      let colegioExistente: Prisma.Colegio | null = null;
      
      if (data.nombreDelCentro) {
        colegioExistente = await this.prisma.colegio.upsert({
          where: { nombre: data.nombreDelCentro },
          update: {
            direccionColegio: data.direccionColegio, 
          },
          create: {
            nombre: data.nombreDelCentro,
            direccionColegio: data.direccionColegio, 
          },
        });
      }

      // 2. Crear el Cliente y el Contacto Familiar en una sola transacción anidada
      const nuevoCliente = await this.prisma.cliente.create({
        data: {
          nombre: data.nombre,
          apellidos: data.apellidos,
          fechaNacimiento: data.fechaNacimiento, 
          alergias: data.alergias,
          activo: true, 
          
          domicilio: data.domicilio, 
          curso: data.cursoEscolar, 
          diagnostico: data.diagnostico,
          tratamientos: data.otrosTratamientos, 
          medicacion: data.medicacion, 

          // Campos booleanos basados en la presencia de datos
          adaptaciones: data.tipoAdaptaciones ? true : false, 
          apoyos: data.numeroDeSesiones && data.numeroDeSesiones.length > 0 ? true : false, 

          // Conecta el colegio si se creó o encontró
          colegio: colegioExistente ? { connect: { id: colegioExistente.id } } : undefined,

          // Creación anidada del contacto familiar (asumo que es una relación 1:N)
          contactosFamiliares: {
            create: {
              nombreContacto: data.nombrePadre || data.nombreMadre || data.otroContactoNombre || 'Contacto Principal', 
              parentesco: 'Contacto Principal', 
              
              emailPadre: data.emailPadre,
              telefonoPadre: data.telefonoPadre ? String(data.telefonoPadre) : undefined,
              
              emailMadre: data.emailMadre,
              telefonoMadre: data.telefonoMadre ? String(data.telefonoMadre) : undefined,
              
              telefonoWhatsapp: data.otroContactoTelefono ? String(data.otroContactoTelefono) : undefined,
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
      const contacto = nuevoCliente.contactosFamiliares[0] || {} as Prisma.Familiar;
      const colegioInfo: Prisma.Colegio | null = nuevoCliente.colegio;

      const n8nPayload: N8nClienteOnboardingPayload = {
        id_cliente_interno: nuevoCliente.id, 
        
        Nombre: nuevoCliente.nombre,
        Apellidos: nuevoCliente.apellidos,
        "Fecha de nacimiento": nuevoCliente.fechaNacimiento ? nuevoCliente.fechaNacimiento.toISOString().split('T')[0] : undefined, 
        Domicilio: nuevoCliente.domicilio, 

        "Nombre del padre": contacto.nombreContacto, 
        "Email padre": contacto.emailPadre,
        "Telefono padre": contacto.telefonoPadre ? Number(contacto.telefonoPadre) : undefined, 
        "Nombre madre": data.nombreMadre, 
        "Email madre": contacto.emailMadre,
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
        Alergias: nuevoCliente.alergias, 
        "Numero de sesiones": data.numeroDeSesiones, 

        "Contacto Colegio 1": undefined, 
        "Relacion contacto colegio 1": undefined,
        "Email contacto colegio 1": undefined,
        "Contacto Colegio 2": undefined,
        "Relacion contacto 2": undefined,
        "Email contacto colegio 2": undefined,
      };

      // 4. Llamada al servicio de n8n
      await this.n8nService.iniciarOnboarding(n8nPayload);

      return nuevoCliente;

    } catch (error) {
      // 5. Manejo y relanzamiento de excepciones
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Loguear el error de Prisma
        console.error('Prisma Error:', error.code, error.message);
        throw new InternalServerErrorException(`Error de base de datos (Prisma): ${error.message}`);
      }
      // Relanzar cualquier otra excepción
      throw new InternalServerErrorException(`Fallo general en la creación del cliente: ${error.message}`);
    }
  }
}
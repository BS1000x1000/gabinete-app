import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { CategoriaDocumento, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import {
  CreateDocumentoDto,
  UpdateDocumentoDto,
  FicheroSubido,
} from './dto/documento.dto';

/** Tipos aceptados. Documentación clínica y administrativa: PDF, imágenes y ofimática. */
export const MIME_TYPES_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

/** 20 MB — suficiente para un informe médico escaneado, corta subidas accidentales de vídeo. */
export const TAMANO_MAX_BYTES = 20 * 1024 * 1024;

const documentoSelect = {
  id: true,
  nombre: true,
  descripcion: true,
  categoria: true,
  mimeType: true,
  tamanoBytes: true,
  fechaDocumento: true,
  createdAt: true,
  updatedAt: true,
  clienteId: true,
  subidoPor: { select: { id: true, nombre: true, apellidos: true } },
} satisfies Prisma.DocumentoClienteSelect;

type UsuarioPeticion = { userId: string; rol: string };

@Injectable()
export class DocumentosService {
  private readonly logger = new Logger(DocumentosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  // ============================================================
  // AUTORIZACIÓN
  // ============================================================

  /**
   * ADMIN y RECEP ven todos los expedientes; el resto solo los clientes
   * que tienen asignados y activos. Mismo criterio que `clientes` e `informes`.
   */
  private async assertAccesoCliente(clienteId: string, user?: UsuarioPeticion) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { id: true },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    if (!user || user.rol === 'ADMIN' || user.rol === 'RECEP') return;

    const asignacion = await this.prisma.clienteTrabajador.findFirst({
      where: { clienteId, trabajadorId: user.userId, activo: true },
      select: { id: true },
    });
    if (!asignacion) {
      throw new ForbiddenException(
        'No tienes acceso a la documentación de este cliente',
      );
    }
  }

  // ============================================================
  // SUBIR
  // ============================================================

  async create(
    dto: CreateDocumentoDto,
    fichero: FicheroSubido,
    user: UsuarioPeticion,
  ) {
    if (!fichero) {
      throw new BadRequestException('No se ha recibido ningún fichero');
    }
    if (!MIME_TYPES_PERMITIDOS.includes(fichero.mimetype as any)) {
      throw new BadRequestException(
        `Tipo de fichero no permitido (${fichero.mimetype}). Admitidos: PDF, imagen, Word y Excel.`,
      );
    }
    if (fichero.size > TAMANO_MAX_BYTES) {
      throw new BadRequestException(
        `El fichero supera el máximo de ${TAMANO_MAX_BYTES / (1024 * 1024)} MB`,
      );
    }

    // Fallo ruidoso: sin Object Storage la subida no puede persistir. Nunca a disco local
    // — los contenedores son efímeros y el fichero desaparecería en el siguiente despliegue.
    if (!this.storage.isConfigured) {
      throw new ServiceUnavailableException(
        'El almacenamiento de ficheros no está configurado (faltan variables SCW_*). ' +
          'No se pueden subir documentos hasta que se configure Object Storage.',
      );
    }

    await this.assertAccesoCliente(dto.clienteId, user);

    // La clave nunca contiene el nombre original: evita filtrar datos del menor
    // en la ruta del objeto y elimina cualquier problema de sanitización.
    const extension = extname(fichero.originalname).slice(0, 10).toLowerCase();
    const storageKey = `clientes/${dto.clienteId}/documentos/${randomUUID()}${extension}`;

    await this.storage.upload(storageKey, fichero.buffer, fichero.mimetype);

    try {
      return await this.prisma.documentoCliente.create({
        data: {
          nombre: (dto.nombre?.trim() || fichero.originalname).slice(0, 180),
          descripcion: dto.descripcion?.trim() || null,
          categoria: dto.categoria,
          storageKey,
          mimeType: fichero.mimetype,
          tamanoBytes: fichero.size,
          fechaDocumento: dto.fechaDocumento ? new Date(dto.fechaDocumento) : null,
          clienteId: dto.clienteId,
          subidoPorId: user.userId,
        },
        select: documentoSelect,
      });
    } catch (error) {
      // El objeto ya está en el bucket pero la fila no se creó: sin la fila es
      // inalcanzable, así que lo borramos para no dejar basura huérfana.
      await this.storage.delete(storageKey).catch((e) =>
        this.logger.error(`No se pudo limpiar el objeto huérfano ${storageKey}`, e),
      );
      throw error;
    }
  }

  // ============================================================
  // LISTAR
  // ============================================================

  async findByCliente(
    clienteId: string,
    user: UsuarioPeticion,
    filtros?: { categoria?: CategoriaDocumento },
  ) {
    await this.assertAccesoCliente(clienteId, user);

    return this.prisma.documentoCliente.findMany({
      where: {
        clienteId,
        ...(filtros?.categoria ? { categoria: filtros.categoria } : {}),
      },
      select: documentoSelect,
      orderBy: [{ fechaDocumento: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, user: UsuarioPeticion) {
    const documento = await this.prisma.documentoCliente.findUnique({
      where: { id },
      select: { ...documentoSelect, storageKey: true, subidoPorId: true },
    });
    if (!documento) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }
    await this.assertAccesoCliente(documento.clienteId, user);
    return documento;
  }

  // ============================================================
  // DESCARGAR
  // ============================================================

  /**
   * Devuelve una URL prefirmada de corta duración en vez de servir el fichero
   * a través de la API: descarga directa desde Object Storage, sin pasar el
   * binario por el contenedor.
   */
  async getUrlDescarga(id: string, user: UsuarioPeticion) {
    const documento = await this.findOne(id, user);

    if (!this.storage.isConfigured) {
      throw new ServiceUnavailableException(
        'El almacenamiento de ficheros no está configurado (faltan variables SCW_*).',
      );
    }

    const url = await this.storage.getSignedUrl(documento.storageKey, 300);
    if (!url) {
      throw new ServiceUnavailableException(
        'No se ha podido generar el enlace de descarga',
      );
    }

    this.logger.log(`Enlace de descarga generado — documento ${id}`);
    return { url, nombre: documento.nombre, mimeType: documento.mimeType };
  }

  // ============================================================
  // ACTUALIZAR METADATOS
  // ============================================================

  async update(id: string, dto: UpdateDocumentoDto, user: UsuarioPeticion) {
    await this.findOne(id, user);

    return this.prisma.documentoCliente.update({
      where: { id },
      data: {
        ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
        ...(dto.descripcion !== undefined
          ? { descripcion: dto.descripcion.trim() || null }
          : {}),
        ...(dto.categoria !== undefined ? { categoria: dto.categoria } : {}),
        ...(dto.fechaDocumento !== undefined
          ? { fechaDocumento: dto.fechaDocumento ? new Date(dto.fechaDocumento) : null }
          : {}),
      },
      select: documentoSelect,
    });
  }

  // ============================================================
  // ELIMINAR
  // ============================================================

  /** Solo ADMIN o quien lo subió — borrar documentación clínica es irreversible. */
  async remove(id: string, user: UsuarioPeticion) {
    const documento = await this.findOne(id, user);

    if (user.rol !== 'ADMIN' && documento.subidoPorId !== user.userId) {
      throw new ForbiddenException(
        'Solo un administrador o quien subió el documento puede eliminarlo',
      );
    }

    await this.prisma.documentoCliente.delete({ where: { id } });

    // La fila ya no existe; si el borrado en el bucket falla, el objeto queda
    // huérfano pero inalcanzable. Se registra para poder limpiarlo después.
    await this.storage.delete(documento.storageKey).catch((e) =>
      this.logger.error(
        `Documento ${id} eliminado en BD pero el objeto ${documento.storageKey} sigue en el bucket`,
        e,
      ),
    );

    this.logger.warn(`Documento ${id} eliminado por ${user.userId}`);
    return { id, eliminado: true };
  }
}

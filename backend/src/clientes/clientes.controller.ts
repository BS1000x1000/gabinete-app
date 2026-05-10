import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  Param,
  Delete,
  Patch,
  NotFoundException,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { clienteInclude, ClienteWithRelations } from './clientes.types';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { TipoSesion } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { Roles } from 'src/roles/roles.decorator';
import { ROLES_CLINICOS, ROLES_GESTION } from 'src/roles/roles.constants';
import { AuditService } from 'src/auth/audit.service';
import { CreateConsentimientoDto } from './dto/create-consentimiento.dto';

@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  private readonly logger = new Logger(ClientesController.name);

  constructor(
    private readonly clientesService: ClientesService,
    private readonly auditService: AuditService,
  ) {}

  // ========================================
  // RUTAS SIN PARÁMETROS (PRIMERO)
  // ========================================

  /**
   * GET /api/clientes
   */
  @Get()
  async findAll(@Req() req: any, @Query() pagination: PaginationDto) {
    this.logger.log('📋 GET /api/clientes');
    return this.clientesService.findAll(req.user, pagination);
  }

  /**
   * POST /api/clientes
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createClienteDto: CreateClienteDto,
    @Req() req: any,
  ): Promise<ClienteWithRelations> {
    this.logger.log(
      `📋 POST /api/clientes - ${createClienteDto.nombre} ${createClienteDto.apellidos}`,
    );
    return this.clientesService.create(createClienteDto, req.user?.userId);
  }

  /**
   * GET /api/clientes/search
   * ✅ DEBE IR ANTES de :id
   */
  @Get('search')
  async search(@Query('q') query: string, @Req() req: any) {
    this.logger.log(`🔍 GET /api/clientes/search?q=${query}`);
    return this.clientesService.search(query, req.user);
  }

  /**
   * GET /api/clientes/mis-clientes
   * Devuelve solo los clientes asignados al terapeuta autenticado
   */
  @Get('mis-clientes')
  async getMisClientes(@Req() req: any) {
    const trabajadorId = req.user.userId;
    this.logger.log(`👤 GET /api/clientes/mis-clientes - Trabajador: ${trabajadorId}`);
    return this.clientesService.findByTrabajador(trabajadorId);
  }

  /**
   * GET /api/clientes/verificar-dni/:dni
   * ✅ Verifica si un DNI ya está registrado
   * ✅ El interceptor global agregará el WrappedResponse automáticamente
   */
  @Get('verificar-dni/:dni')
  @HttpCode(HttpStatus.OK)
  async verificarDni(@Param('dni') dni: string) {
    this.logger.log(`🔍 Verificando DNI: ${dni}`);

    const existe = await this.clientesService.existeDni(dni);

    // ✅ Retornar objeto simple, el interceptor lo envolverá automáticamente
    return {
      dni,
      disponible: !existe,
      mensaje: existe ? 'DNI ya registrado' : 'DNI disponible',
    };
  }

  // ========================================
  // RUTAS ESPECÍFICAS CON PARÁMETROS (SEGUNDO)
  // ========================================

  /**
   * GET /api/clientes/:id/objetivos-generales/estadisticas
   * ✅ Ruta MÁS específica (3 segmentos) - VA PRIMERO
   */
  @Get(':id/objetivos-generales/estadisticas')
  async getEstadisticasObjetivos(@Param('id') id: string) {
    this.logger.log(
      `📊 GET /api/clientes/${id}/objetivos-generales/estadisticas`,
    );
    return this.clientesService.getEstadisticasObjetivos(id);
  }

  /**
   * GET /api/clientes/:id/objetivos-generales
   * ✅ Ruta específica (2 segmentos)
   */
  @Get(':id/objetivos-generales')
  async getObjetivosGenerales(@Param('id') id: string) {
    this.logger.log(`🎯 GET /api/clientes/${id}/objetivos-generales`);
    return this.clientesService.getObjetivosGenerales(id);
  }

  /**
   * POST /api/clientes/:id/objetivos-generales
   */
  @Post(':id/objetivos-generales')
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.CREATED)
  async asignarObjetivosGenerales(
    @Param('id') id: string,
    @Body() body: { objetivosGeneralesIds: string[] },
  ) {
    this.logger.log(`🎯 POST /api/clientes/${id}/objetivos-generales`);
    this.logger.log(
      `Objetivos a asignar: ${body.objetivosGeneralesIds.length}`,
    );
    return this.clientesService.asignarObjetivosGenerales(
      id,
      body.objetivosGeneralesIds,
    );
  }

  /**
   * POST /api/clientes/:id/asignar-trabajador
   * Asigna un trabajador adicional a un cliente existente
   */
  @Post(':id/asignar-trabajador')
  @HttpCode(HttpStatus.CREATED)
  async asignarTrabajador(
    @Param('id') id: string,
    @Body()
    body: {
      trabajadorId: string;
      tipoTerapia: TipoSesion;
      horarios: { diaSemana: number; horaInicio: string; horaFin: string }[];
    },
  ) {
    this.logger.log(`🎯 POST /api/clientes/${id}/asignar-trabajador`);
    return this.clientesService.asignarTrabajador(
      id,
      body.trabajadorId,
      body.tipoTerapia,
      body.horarios,
    );
  }

  /**
   * DELETE /api/clientes/:clienteId/asignaciones/:asignacionId
   * Elimina una asignación cliente-trabajador por su ID directo
   */
  @Delete(':clienteId/asignaciones/:asignacionId')
  @HttpCode(HttpStatus.OK)
  async desasignarTrabajador(
    @Param('clienteId') clienteId: string,
    @Param('asignacionId') asignacionId: string,
  ) {
    this.logger.log(
      `🎯 DELETE /api/clientes/${clienteId}/asignaciones/${asignacionId}`,
    );
    return this.clientesService.desasignarTrabajador(clienteId, asignacionId);
  }

  /**
   * PATCH /api/clientes/:clienteId/asignaciones/:asignacionId/horarios
   * Reemplaza todos los horarios de una asignación
   */
  @Patch(':clienteId/asignaciones/:asignacionId/horarios')
  @HttpCode(HttpStatus.OK)
  async actualizarHorariosAsignacion(
    @Param('clienteId') clienteId: string,
    @Param('asignacionId') asignacionId: string,
    @Body()
    body: {
      horarios: { diaSemana: number; horaInicio: string; horaFin: string }[];
      confirmarActualizacionSesiones?: boolean;
    },
  ) {
    this.logger.log(
      `🕐 PATCH /api/clientes/${clienteId}/asignaciones/${asignacionId}/horarios - confirmar: ${body.confirmarActualizacionSesiones ?? false}`,
    );
    return this.clientesService.actualizarHorariosAsignacion(
      clienteId,
      asignacionId,
      body.horarios,
      body.confirmarActualizacionSesiones ?? false,
    );
  }

  // ── FAMILIARES ────────────────────────────────────────────
  @Post(':id/familiares')
  @HttpCode(HttpStatus.CREATED)
  async crearFamiliar(@Param('id') id: string, @Body() body: any) {
    this.logger.log(`👨‍👩‍👧 POST /api/clientes/${id}/familiares`);
    return this.clientesService.crearFamiliar(id, body);
  }

  @Patch(':id/familiares/:familiarId')
  async updateFamiliar(
    @Param('id') id: string,
    @Param('familiarId') familiarId: string,
    @Body() body: any,
  ) {
    this.logger.log(`👨‍👩‍👧 PATCH /api/clientes/${id}/familiares/${familiarId}`);
    return this.clientesService.updateFamiliar(id, familiarId, body);
  }

  @Delete(':id/familiares/:familiarId')
  @HttpCode(HttpStatus.OK)
  async eliminarFamiliar(
    @Param('id') id: string,
    @Param('familiarId') familiarId: string,
  ) {
    this.logger.log(`👨‍👩‍👧 DELETE /api/clientes/${id}/familiares/${familiarId}`);
    return this.clientesService.eliminarFamiliar(id, familiarId);
  }

  // ── SANITARIO ─────────────────────────────────────────────
  @Patch(':id/sanitario')
  @Roles(...ROLES_CLINICOS)
  async updateSanitario(@Param('id') id: string, @Body() body: any) {
    this.logger.log(`🏥 PATCH /api/clientes/${id}/sanitario`);
    return this.clientesService.updateSanitario(id, body);
  }

  // ── COLEGIO ───────────────────────────────────────────────
  @Patch(':id/colegio')
  async updateColegio(@Param('id') id: string, @Body() body: any) {
    this.logger.log(`🏫 PATCH /api/clientes/${id}/colegio`);
    return this.clientesService.updateColegio(id, body);
  }

  /**
   * DELETE /api/clientes/:id/objetivos-generales/:objetivoId
   */
  @Delete(':id/objetivos-generales/:objetivoId')
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.OK)
  async desasignarObjetivoGeneral(
    @Param('id') id: string,
    @Param('objetivoId') objetivoId: string,
  ) {
    this.logger.log(
      `🎯 DELETE /api/clientes/${id}/objetivos-generales/${objetivoId}`,
    );
    return this.clientesService.desasignarObjetivoGeneral(id, objetivoId);
  }

  // ── DATOS PAGADOR (FACTURACIÓN) ──────────────────────────

  @Patch(':id/datos-pagador')
  async updateDatosPagador(@Param('id') id: string, @Body() body: any) {
    this.logger.log(`💶 PATCH /api/clientes/${id}/datos-pagador`);
    return this.clientesService.updateDatosPagador(id, body);
  }

  // ── CONSENTIMIENTO RGPD ───────────────────────────────────

  /**
   * POST /api/clientes/:id/consentimiento
   * Registra un consentimiento RGPD firmado por el tutor legal
   */
  @Post(':id/consentimiento')
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.CREATED)
  async registrarConsentimiento(
    @Param('id') clienteId: string,
    @Body() dto: CreateConsentimientoDto,
    @Req() req: any,
  ) {
    this.logger.log(`📝 POST /api/clientes/${clienteId}/consentimiento`);
    dto.ipRegistro = dto.ipRegistro ?? req.ip;
    return this.clientesService.registrarConsentimiento(clienteId, req.user.userId, dto);
  }

  /**
   * GET /api/clientes/:id/consentimientos
   * Historial de consentimientos RGPD del cliente
   */
  @Get(':id/consentimientos')
  async getHistoricoConsentimientos(@Param('id') clienteId: string) {
    this.logger.log(`📋 GET /api/clientes/${clienteId}/consentimientos`);
    return this.clientesService.getHistoricoConsentimientos(clienteId);
  }

  /**
   * DELETE /api/clientes/:id/anonimizar
   * Anonimiza un cliente (solo ADMIN, requiere soft-delete previo)
   */
  @Delete(':id/anonimizar')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async anonimizarCliente(@Param('id') id: string, @Req() req: any) {
    this.logger.warn(`🔒 DELETE /api/clientes/${id}/anonimizar - solicitado por ${req.user?.userId}`);
    this.auditService.registrar({
      evento: 'ACCESO_FICHA',
      userId: req.user?.userId,
      username: req.user?.username,
      ip: req.ip,
      recurso: id,
      metadata: { accion: 'ANONIMIZAR_CLIENTE' },
    });
    await this.clientesService.anonimizarCliente(id);
    return { message: 'Cliente anonimizado correctamente', id, status: 'success' };
  }

  // ========================================
  // RUTAS GENÉRICAS CON :id (ÚLTIMO)
  // ========================================

  /**
   * GET /api/clientes/:id/export
   * Exportación completa de datos personales del cliente (RGPD Art. 20 — portabilidad)
   * Solo ADMIN o RECEP pueden solicitar la exportación
   */
  @Get(':id/export')
  @Roles(...ROLES_GESTION)
  async exportarDatos(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`📤 GET /api/clientes/${id}/export`);
    this.auditService.registrar({
      evento: 'ACCESO_FICHA',
      userId: req.user?.userId,
      username: req.user?.username,
      ip: req.ip,
      recurso: id,
      metadata: { accion: 'EXPORT_RGPD' },
    });
    return this.clientesService.exportarDatos(id);
  }

  /**
   * GET /api/clientes/:id
   * ⚠️ DEBE IR AL FINAL (captura todo lo que no matcheó antes)
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any): Promise<ClienteWithRelations> {
    this.logger.log(`📋 GET /api/clientes/${id}`);
    const cliente = await this.clientesService.findOne(id, req.user);

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    this.auditService.registrar({
      evento: 'ACCESO_FICHA',
      userId: req.user?.userId,
      username: req.user?.username,
      ip: req.ip,
      recurso: id,
    });

    return cliente;
  }

  /**
   * PATCH /api/clientes/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: Partial<CreateClienteDto>,
    @Req() req: any,
  ): Promise<ClienteWithRelations> {
    this.logger.log(`📋 PATCH /api/clientes/${id}`);
    return this.clientesService.update(id, updateClienteDto, req.user?.userId);
  }

  /**
   * DELETE /api/clientes/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`📋 DELETE /api/clientes/${id}`);
    await this.clientesService.remove(id);

    return {
      message: 'Cliente eliminado correctamente',
      id: id,
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }
}

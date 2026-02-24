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
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { clienteInclude, ClienteWithRelations } from './clientes.types';
import { PaginationDto } from './dto/pagination.dto';

@Controller('clientes')
export class ClientesController {
  private readonly logger = new Logger(ClientesController.name);

  constructor(private readonly clientesService: ClientesService) {}

  // ========================================
  // RUTAS SIN PARÁMETROS (PRIMERO)
  // ========================================

  /**
   * GET /api/clientes
   */
  @Get()
  async findAll() {
    this.logger.log('📋 GET /api/clientes');
    return this.clientesService.findAll();
  }

  /**
   * POST /api/clientes
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createClienteDto: CreateClienteDto,
  ): Promise<ClienteWithRelations> {
    this.logger.log(
      `📋 POST /api/clientes - ${createClienteDto.nombre} ${createClienteDto.apellidos}`,
    );
    return this.clientesService.create(createClienteDto);
  }

  /**
   * GET /api/clientes/search
   * ✅ DEBE IR ANTES de :id
   */
  @Get('search')
  async search(@Query('q') query: string) {
    this.logger.log(`🔍 GET /api/clientes/search?q=${query}`);
    return this.clientesService.search(query);
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
  @Body() body: {
    trabajadorId: string;
    tipoTerapia: string;
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
   * DELETE /api/clientes/:id/objetivos-generales/:objetivoId
   */
  @Delete(':id/objetivos-generales/:objetivoId')
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

  // ========================================
  // RUTAS GENÉRICAS CON :id (ÚLTIMO)
  // ========================================

  /**
   * GET /api/clientes/:id
   * ⚠️ DEBE IR AL FINAL (captura todo lo que no matcheó antes)
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ClienteWithRelations> {
    this.logger.log(`📋 GET /api/clientes/${id}`);
    const cliente = await this.clientesService.findOne(id);

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }

  /**
   * PATCH /api/clientes/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: Partial<CreateClienteDto>,
  ): Promise<ClienteWithRelations> {
    this.logger.log(`📋 PATCH /api/clientes/${id}`);
    return this.clientesService.update(id, updateClienteDto);
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
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
  // ✅ Asegúrate de exportar la clase
  private readonly logger = new Logger(ClientesController.name);

  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createClienteDto: CreateClienteDto,
  ): Promise<ClienteWithRelations> {
    this.logger.log(
      `Petición para crear cliente: ${createClienteDto.nombre} ${createClienteDto.apellidos}`,
    );
    return this.clientesService.create(createClienteDto); // ✅ Delega al servicio
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.clientesService.findAllPaginated(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ClienteWithRelations> {
    this.logger.log(`Buscando cliente con ID: ${id}`);
    const cliente = await this.clientesService.findOne(id);

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }

  // Obtener objetivos generales del cliente
  @Get(':id/objetivos-generales')
  async getObjetivosGenerales(@Param('id') id: string) {
    this.logger.log(`Obteniendo objetivos generales del cliente: ${id}`);
    return this.clientesService.getObjetivosGenerales(id);
  }

  // Asignar objetivos generales a un cliente
  @Post(':id/objetivos-generales')
  @HttpCode(HttpStatus.CREATED)
  async asignarObjetivosGenerales(
    @Param('id') id: string,
    @Body() body: { objetivosGeneralesIds: string[] },
  ) {
    this.logger.log(`Asignando objetivos generales al cliente: ${id}`);
    return this.clientesService.asignarObjetivosGenerales(
      id,
      body.objetivosGeneralesIds,
    );
  }

  // Desasignar un objetivo general
  @Delete(':id/objetivos-generales/:objetivoId')
  @HttpCode(HttpStatus.OK)
  async desasignarObjetivoGeneral(
    @Param('id') id: string,
    @Param('objetivoId') objetivoId: string,
  ) {
    this.logger.log(`Desasignando objetivo ${objetivoId} del cliente ${id}`);
    return this.clientesService.desasignarObjetivoGeneral(id, objetivoId);
  }

  // Estadísticas de objetivos
  @Get(':id/objetivos-generales/estadisticas')
  async getEstadisticasObjetivos(@Param('id') id: string) {
    this.logger.log(`Obteniendo estadísticas de objetivos del cliente: ${id}`);
    return this.clientesService.getEstadisticasObjetivos(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: Partial<CreateClienteDto>,
  ): Promise<ClienteWithRelations> {
    this.logger.log(`Actualizando cliente con ID: ${id}`);
    return this.clientesService.update(id, updateClienteDto); // ✅ Delega al servicio
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    this.logger.warn(`Solicitud de eliminación para cliente con ID: ${id}`);
    await this.clientesService.remove(id);

    return {
      message: 'Cliente eliminado correctamente',
      id: id,
      status: 'success',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.clientesService.search(query);
  }
}

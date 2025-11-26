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
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/clientedto-interface';

@Controller('clientes')
export class ClientesController {
  private readonly logger = new Logger(ClientesController.name);

  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createClienteDto: CreateClienteDto,
  ): Promise<any> { 
    
    this.logger.log(`Recibida solicitud para crear nuevo cliente: ${createClienteDto.nombre} ${createClienteDto.apellidos}`);

    return this.clientesService.create(createClienteDto);
  }

  @Get()
  async findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: CreateClienteDto) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.clientesService.remove(id);
    return { message: 'Cliente eliminado correctamente' };
  }
}
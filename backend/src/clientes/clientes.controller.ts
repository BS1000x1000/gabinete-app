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
  ParseIntPipe,
  Put, 
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/clientedto-interface';
import { UpdateClienteDto } from './dto/update-cliente.dto';

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
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: string, @Body() dto: UpdateClienteDto) {
    return this.clientesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: string) {
    await this.clientesService.remove(id);
    return { message: 'Cliente eliminado correctamente' };
  }
}
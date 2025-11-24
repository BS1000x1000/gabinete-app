import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Logger 
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
}
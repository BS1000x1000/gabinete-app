import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req 
} from '@nestjs/common';
import { FichajeService } from './fichaje.service';
import { CreateRegistroDiarioDto } from './dto/fichajedto.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
 
@Controller('fichaje')
export class FichajeController {
  constructor(private readonly registroDiarioService: FichajeService) {}

  /* ---------- POST: Crear nuevo registro ---------- */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateRegistroDiarioDto, @Req() req: any) {
    // Extraemos el ID del trabajador del objeto user que JwtAuthGuard inyecta en la request
    // Normalmente es 'req.user.id' o 'req.user.sub' dependiendo de tu estrategia de Passport
    console.log(req);
    const trabajadorId = req.user.userId; 
    return await this.registroDiarioService.create(createDto, trabajadorId);
  }

  /* ---------- GET: Obtener todos los registros de un cliente ---------- */
  @Get('cliente/:clienteId')
  async findByCliente(@Param('clienteId') clienteId: string) {
    return await this.registroDiarioService.findByCliente(clienteId);
  }

  /* ---------- GET: Obtener un registro específico por ID ---------- */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.registroDiarioService.findOne(id);
  }

  /* ---------- PATCH: Actualizar contenido de un registro ---------- */
  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body('contenido') contenido: string
  ) {
    return await this.registroDiarioService.update(id, contenido);
  }

  /* ---------- DELETE: Eliminar un registro ---------- */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.registroDiarioService.remove(id);
  }
}
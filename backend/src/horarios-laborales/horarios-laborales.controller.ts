import {
  Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards, Logger, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { HorariosLaboralesService } from './horarios-laborales.service';
import { CreateHorarioLaboralDto, UpdateHorarioLaboralDto } from './dto/horario-laboral.dto';
import { Roles } from '../roles/roles.decorator';
import { ROLES_CLINICOS } from '../roles/roles.constants';

/**
 * Disponibilidad declarada del terapeuta: cuando puede ofrecer hueco. Solo
 * sirve para avisar al programar sesiones; nunca bloquea.
 *
 * **Cada autónomo escribe la suya y nadie más**, ni un ADMIN: mismo criterio
 * que los bloques de administración, con los que comparte pestaña ("Mi
 * semana"). Leerla sí puede ROLES_GESTION, en solo lectura.
 */
@Controller('horarios-laborales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ROLES_CLINICOS)
export class HorariosLaboralesController {
  private readonly logger = new Logger(HorariosLaboralesController.name);

  constructor(private readonly service: HorariosLaboralesService) {}

  @Get('trabajador/:trabajadorId')
  async findByTrabajador(@Param('trabajadorId') trabajadorId: string, @Req() req: any) {
    return this.service.findByTrabajador(trabajadorId, req.user);
  }

  @Post('trabajador/:trabajadorId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('trabajadorId') trabajadorId: string,
    @Body() dto: CreateHorarioLaboralDto,
    @Req() req: any,
  ) {
    this.logger.log(`POST /horarios-laborales/trabajador/${trabajadorId}`);
    return this.service.create(trabajadorId, dto, req.user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateHorarioLaboralDto, @Req() req: any) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user);
  }
}

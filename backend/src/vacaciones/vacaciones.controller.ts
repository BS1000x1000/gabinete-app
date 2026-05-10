import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { VacacionesService } from './vacaciones.service';
import { CreateVacacionesDto } from './dto/create-vacaciones.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_CLINICOS } from '../roles/roles.constants';

@Controller('vacaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VacacionesController {
  constructor(private readonly vacacionesService: VacacionesService) {}

  @Get('mis-vacaciones')
  @Roles(...ROLES_CLINICOS)
  getMisVacaciones(@Req() req: any, @Query('trabajadorId') trabajadorId?: string) {
    const targetId = this.resolveTarget(req.user, trabajadorId);
    return this.vacacionesService.getMisVacaciones(targetId);
  }

  @Get('verificar-conflictos')
  @Roles(...ROLES_CLINICOS)
  verificarConflictos(
    @Req() req: any,
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Query('trabajadorId') trabajadorId?: string,
  ) {
    const targetId = this.resolveTarget(req.user, trabajadorId);
    return this.vacacionesService.verificarConflictos(targetId, desde, hasta);
  }

  @Get()
  @Roles('ADMIN')
  getAll(@Req() req: any) {
    return this.vacacionesService.getAll(req.user);
  }

  @Post()
  @Roles(...ROLES_CLINICOS)
  create(@Req() req: any, @Body() dto: CreateVacacionesDto, @Query('trabajadorId') trabajadorId?: string) {
    const targetId = this.resolveTarget(req.user, trabajadorId);
    return this.vacacionesService.create(targetId, dto);
  }

  @Delete(':id')
  @Roles(...ROLES_CLINICOS)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.vacacionesService.remove(id, req.user);
  }

  private resolveTarget(user: { userId: string; rol: string }, trabajadorId?: string): string {
    if (!trabajadorId || trabajadorId === user.userId) return user.userId;
    if (user.rol !== 'ADMIN') throw new ForbiddenException('Solo ADMIN puede gestionar vacaciones de otros trabajadores');
    return trabajadorId;
  }
}

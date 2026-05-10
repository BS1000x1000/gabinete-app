import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
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
  getMisVacaciones(@Req() req: any) {
    return this.vacacionesService.getMisVacaciones(req.user.userId);
  }

  @Get()
  @Roles('ADMIN')
  getAll(@Req() req: any) {
    return this.vacacionesService.getAll(req.user);
  }

  @Post()
  @Roles(...ROLES_CLINICOS)
  create(@Req() req: any, @Body() dto: CreateVacacionesDto) {
    return this.vacacionesService.create(req.user.userId, dto);
  }

  @Delete(':id')
  @Roles(...ROLES_CLINICOS)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.vacacionesService.remove(id, req.user);
  }
}

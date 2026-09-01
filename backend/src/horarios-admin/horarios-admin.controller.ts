import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_CLINICOS } from '../roles/roles.constants';
import { CreateHorarioAdminDto } from './dto/create-horario-admin.dto';
import { UpdateHorarioAdminDto } from './dto/update-horario-admin.dto';
import { HorariosAdminService } from './horarios-admin.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...ROLES_CLINICOS)
@Controller('horarios-admin')
export class HorariosAdminController {
  constructor(private readonly service: HorariosAdminService) {}

  @Get()
  findAll(@Req() req: any, @Query('trabajadorId') trabajadorId?: string) {
    return this.service.findAll(req.user.userId, req.user.rol, trabajadorId);
  }

  @Post()
  create(@Body() dto: CreateHorarioAdminDto, @Req() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHorarioAdminDto, @Req() req: any) {
    return this.service.update(id, dto, req.user.userId, req.user.rol);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.userId, req.user.rol);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventosAgendaService } from './eventos-agenda.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

@UseGuards(JwtAuthGuard)
@Controller('eventos-agenda')
export class EventosAgendaController {
  constructor(private readonly service: EventosAgendaService) {}

  @Post()
  create(@Body() dto: CreateEventoDto, @Req() req: any) {
    return this.service.create(dto, req.user.userId, req.user.rol);
  }

  @Get()
  findAll(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Query('trabajadorId') trabajadorId: string | undefined,
    @Req() req: any,
  ) {
    return this.service.findByPeriodo(
      req.user.userId,
      req.user.rol,
      desde,
      hasta,
      trabajadorId,
    );
  }

  @Get('horas')
  getResumenHoras(
    @Query('desde') desde: string,
    @Query('hasta') hasta: string,
    @Query('trabajadorId') trabajadorId: string | undefined,
    @Req() req: any,
  ) {
    return this.service.getResumenHoras(
      req.user.userId,
      req.user.rol,
      desde,
      hasta,
      trabajadorId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.service.findOne(id, req.user.userId, req.user.rol);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEventoDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user.userId, req.user.rol);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.userId, req.user.rol);
  }
}

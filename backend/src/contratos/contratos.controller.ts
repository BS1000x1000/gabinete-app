import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Req,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { ROLES_CLINICOS } from '../roles/roles.constants';

@Controller('contratos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContratosController {
  private readonly logger = new Logger(ContratosController.name);

  constructor(private readonly contratosService: ContratosService) {}

  @Post()
  @Roles(...ROLES_CLINICOS)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContratoDto, @Req() req: any) {
    this.logger.log(`POST /contratos - cliente ${dto.clienteId}`);
    return this.contratosService.create(dto, req.user);
  }

  @Get()
  findAll(@Req() req: any) {
    this.logger.log(`GET /contratos - user ${req.user.userId}`);
    return this.contratosService.findAll(req.user);
  }

  @Get('cliente/:clienteId')
  findByCliente(@Param('clienteId') clienteId: string, @Req() req: any) {
    this.logger.log(`GET /contratos/cliente/${clienteId}`);
    return this.contratosService.findByCliente(clienteId, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`GET /contratos/${id}`);
    return this.contratosService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(...ROLES_CLINICOS)
  update(@Param('id') id: string, @Body() dto: UpdateContratoDto, @Req() req: any) {
    this.logger.log(`PATCH /contratos/${id}`);
    return this.contratosService.update(id, dto, req.user);
  }

  @Patch(':id/finalizar')
  @Roles(...ROLES_CLINICOS)
  finalizar(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`PATCH /contratos/${id}/finalizar`);
    return this.contratosService.finalizar(id, req.user);
  }

  @Get(':id/pdf')
  async getPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    this.logger.log(`GET /contratos/${id}/pdf`);
    const buffer = await this.contratosService.generarPdf(id, req.user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="contrato-${id}.pdf"`,
      'Content-Length': String(buffer.length),
    });
    res.end(buffer);
  }
}

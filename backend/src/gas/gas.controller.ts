import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SetDescripcionesNivelesDto, UpdateDescripcionNivelDto, CreateEvaluacionGASDto } from './dto/gas.dto';
import { GasService } from './gas.service';

// Todas las rutas están agrupadas bajo el ClienteObjetivo:
//
//   /gas/objetivo/:clienteObjetivoId/...
//
// Esto es consistente con el schema: el ClienteObjetivo es el
// nexo entre un cliente y un objetivo general concreto.

@Controller('gas')
@UseGuards(JwtAuthGuard)
export class GasController {
  private readonly logger = new Logger(GasController.name);

  constructor(private readonly gasService: GasService) {}

  // ============================================================
  // VISTA COMPLETA (niveles + historial)
  // Endpoint principal que usa la ficha del cliente
  // ============================================================

  /**
   * GET /gas/objetivo/:clienteObjetivoId
   * Devuelve el resumen completo: niveles definidos + historial de evaluaciones
   */
  @Get('objetivo/:clienteObjetivoId')
  async getResumenObjetivo(
    @Param('clienteObjetivoId') clienteObjetivoId: string,
  ) {
    this.logger.log(`GET /gas/objetivo/${clienteObjetivoId}`);
    return this.gasService.getResumenObjetivo(clienteObjetivoId);
  }

  // ============================================================
  // DESCRIPCIONES DE NIVELES
  // ============================================================

  /**
   * GET /gas/objetivo/:clienteObjetivoId/niveles
   * Los 5 textos que definen qué significa cada nivel para este objetivo
   */
  @Get('objetivo/:clienteObjetivoId/niveles')
  async getDescripcionesNiveles(
    @Param('clienteObjetivoId') clienteObjetivoId: string,
  ) {
    this.logger.log(`GET /gas/objetivo/${clienteObjetivoId}/niveles`);
    return this.gasService.getDescripcionesNiveles(clienteObjetivoId);
  }

  /**
   * POST /gas/objetivo/:clienteObjetivoId/niveles
   * Guarda o sobreescribe los 5 niveles de golpe
   * Se usa al definir el objetivo en el informe inicial
   */
  @Post('objetivo/:clienteObjetivoId/niveles')
  @HttpCode(HttpStatus.CREATED)
  async setDescripcionesNiveles(
    @Param('clienteObjetivoId') clienteObjetivoId: string,
    @Body() dto: SetDescripcionesNivelesDto,
  ) {
    this.logger.log(`POST /gas/objetivo/${clienteObjetivoId}/niveles`);
    return this.gasService.setDescripcionesNiveles(clienteObjetivoId, dto);
  }

  /**
   * PATCH /gas/objetivo/:clienteObjetivoId/niveles/:nivel
   * Actualiza la descripción de un nivel concreto (-2, -1, 0, 1, 2)
   */
  @Patch('objetivo/:clienteObjetivoId/niveles/:nivel')
  async updateDescripcionNivel(
    @Param('clienteObjetivoId') clienteObjetivoId: string,
    @Param('nivel', ParseIntPipe) nivel: number,
    @Body() dto: UpdateDescripcionNivelDto,
  ) {
    this.logger.log(
      `PATCH /gas/objetivo/${clienteObjetivoId}/niveles/${nivel}`,
    );
    return this.gasService.updateDescripcionNivel(
      clienteObjetivoId,
      nivel,
      dto,
    );
  }

  // ============================================================
  // EVALUACIONES GAS
  // ============================================================

  /**
   * GET /gas/objetivo/:clienteObjetivoId/evaluaciones
   * Historial completo de evaluaciones (del más reciente al más antiguo)
   */
  @Get('objetivo/:clienteObjetivoId/evaluaciones')
  async getHistorialEvaluaciones(
    @Param('clienteObjetivoId') clienteObjetivoId: string,
  ) {
    this.logger.log(
      `GET /gas/objetivo/${clienteObjetivoId}/evaluaciones`,
    );
    return this.gasService.getHistorialEvaluaciones(clienteObjetivoId);
  }

  /**
   * POST /gas/objetivo/:clienteObjetivoId/evaluaciones
   * Registra una nueva evaluación GAS
   * Actualiza automáticamente nivelGASActual en ClienteObjetivo
   */
  @Post('objetivo/:clienteObjetivoId/evaluaciones')
  @HttpCode(HttpStatus.CREATED)
  async createEvaluacion(
    @Param('clienteObjetivoId') clienteObjetivoId: string,
    @Body() dto: CreateEvaluacionGASDto,
  ) {
    this.logger.log(
      `POST /gas/objetivo/${clienteObjetivoId}/evaluaciones - Nivel: ${dto.nivel}`,
    );
    return this.gasService.createEvaluacion(clienteObjetivoId, dto);
  }

  /**
   * DELETE /gas/evaluaciones/:evaluacionId
   * Elimina una evaluación concreta del historial
   * Recalcula automáticamente el nivelGASActual
   */
  @Delete('evaluaciones/:evaluacionId')
  @HttpCode(HttpStatus.OK)
  async deleteEvaluacion(@Param('evaluacionId') evaluacionId: string) {
    this.logger.warn(`DELETE /gas/evaluaciones/${evaluacionId}`);
    return this.gasService.deleteEvaluacion(evaluacionId);
  }
}
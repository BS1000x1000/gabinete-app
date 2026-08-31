import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Multer aborta la subida por su cuenta cuando el fichero supera `limits.fileSize`,
 * antes de que el servicio pueda validarlo. `MulterError` no extiende `HttpException`,
 * así que el filtro global lo convertiría en un 500 opaco. Aquí lo traducimos a un 400
 * con un mensaje que el usuario pueda entender.
 *
 * El límite se pasa al construirlo porque cada módulo tiene el suyo
 * (documentos 20 MB, contratos 10 MB) y el mensaje debe citar el correcto:
 *
 * ```ts
 * @UseFilters(new MulterExceptionFilter(TAMANO_MAX_CONTRATO))
 * ```
 */
@Catch()
export class MulterExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MulterExceptionFilter.name);

  constructor(private readonly maxBytes?: number) {}

  catch(exception: any, host: ArgumentsHost) {
    // Solo interceptamos errores de multer; el resto sigue al filtro global.
    if (exception?.name !== 'MulterError') throw exception;

    const res = host.switchToHttp().getResponse<Response>();
    const req = host.switchToHttp().getRequest<Request>();

    const limite = this.maxBytes
      ? ` de ${this.maxBytes / (1024 * 1024)} MB`
      : ' permitido';

    const message =
      exception.code === 'LIMIT_FILE_SIZE'
        ? `El fichero supera el tamaño máximo${limite}`
        : `Subida no válida (${exception.code})`;

    this.logger.warn(`Subida rechazada por multer: ${exception.code}`);

    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      message,
      timestamp: new Date().toISOString(),
      path: (req as any).url,
    });
  }
}

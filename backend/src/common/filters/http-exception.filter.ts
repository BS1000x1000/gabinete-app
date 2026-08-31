import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

/** Campos con nombre legible para el mensaje de conflicto. */
const ETIQUETA_CAMPO: Record<string, string> = {
  dni: 'DNI',
  email: 'email',
  username: 'nombre de usuario',
  nombre: 'nombre',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Violacion de restriccion unica en BD. Sin esto sale como 500 opaco y el
    // usuario no sabe que el problema es un duplicado.
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      exception.code === 'P2002'
    ) {
      // Segun el conector, `target` llega como array de campos (['dni']) o como
      // nombre de la constraint ('clientes_dni_key'). Cubrimos ambas formas.
      const target = exception.meta?.target;
      const campos: string[] = Array.isArray(target)
        ? (target as string[])
        : typeof target === 'string'
          ? Object.keys(ETIQUETA_CAMPO).filter((c) => target.includes(c))
          : [];
      const legibles = campos.map((c) => ETIQUETA_CAMPO[c] ?? c);

      status = HttpStatus.CONFLICT;
      error = 'Conflict';
      message = legibles.length
        ? `Ya existe un registro con ese ${legibles.join(' y ')}`
        : 'Ya existe un registro con esos datos';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      } else {
        message = exceptionResponse;
      }
    }

    this.logger.error(
      `${request.method} ${request.url} - Status: ${status} - Message: ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
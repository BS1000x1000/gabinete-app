import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class N8nApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-n8n-key'];

    if (!apiKey || apiKey !== process.env.N8N_WEBHOOK_SECRET) {
      throw new UnauthorizedException('API key inválida');
    }

    return true;
  }
}

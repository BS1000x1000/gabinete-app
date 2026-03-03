import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { N8nClienteOnboardingPayload } from './interface/n8n-cliente.interface.js';

@Injectable()
export class N8nService {
  constructor(private readonly httpService: HttpService) {}

  private readonly N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/676c7f2c-fb04-49f6-85e6-39d0ea98346b'; 
  
  async iniciarOnboarding(clienteData: N8nClienteOnboardingPayload): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.N8N_WEBHOOK_URL, clienteData)
      );
      
      if (response.data && response.data.message === 'Workflow was started') {
        return `Onboarding iniciado en n8n con éxito para el Cliente ID: ${clienteData.id_cliente_interno}. Respuesta: ${response.data.message}`;
      }
      
      return 'Onboarding iniciado, pero la respuesta de n8n fue inesperada.';

    } catch (error) {
      throw new InternalServerErrorException(
        `Error de comunicación con n8n: ${error.message}`
      );
    }
  }
}
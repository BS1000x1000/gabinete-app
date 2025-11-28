// services/clientes.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteData } from '../../interface/cliente.interface';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private api = 'http://localhost:3000/clientes';

  readonly clienteActual = signal<ClienteData | null>(null);

  constructor(private http: HttpClient) {}

  getAll(): Observable<ClienteData[]> {
    return this.http.get<ClienteData[]>(this.api);
  }

  getClienteById(id: string): Observable<ClienteData[]> {
    return this.http.get<ClienteData[]>(`${this.api}/${id}`);
  }

  create(data: ClienteData): Observable<ClienteData> {
    return this.http.post<ClienteData>(this.api, data);
  }

  update(id: string, changes: Partial<ClienteData>): Observable<ClienteData> {
    return this.http.patch<ClienteData>(`${this.api}/${id}`, changes);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  setCliente(cliente: ClienteData): void {
    this.clienteActual.set(cliente);
    console.log(`Estado del cliente actualizado: ${cliente.nombre}`);
  }

  clearCliente(): void {
    this.clienteActual.set(null);
    console.log('Estado del cliente limpiado.');
  }
}

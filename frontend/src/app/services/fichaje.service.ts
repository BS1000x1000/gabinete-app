import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Observable, tap } from "rxjs";
import { RegistroDiario } from "../../interface/registro-diario.interface";

@Injectable({ providedIn: 'root' })
export class fichajeService {

    private http = inject(HttpClient);
    private api = 'http://localhost:3000';

    //Estado reactivo de los registros del cliente actual
    registros = signal<RegistroDiario[]>([]);

    getRegistros(clienteId: string): Observable<RegistroDiario[]> {
        return this.http.get<RegistroDiario[]>(`${this.api}/fichaje/cliente/${clienteId}`)
        .pipe(tap(res => this.registros.set(res)));
    }

    guardarRegistros(registro: Partial<RegistroDiario>): Observable<RegistroDiario> {
        return this.http.post<RegistroDiario>(`${this.api}/fichaje`, registro)
        .pipe(tap(nuevo => {
            // Actualizamos el signal local añadiento el nuevo al principio
            this.registros.update(prev => [nuevo, ...prev]);
        }))
    }

}
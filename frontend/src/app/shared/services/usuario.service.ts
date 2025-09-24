import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private http = inject(HttpClient);
  private apiUrl = 'api_url/trabajadores';

  public createUsuario(user: any): Observable<any> {
    console.log('Trabajador creado');
    return this.http.post(this.apiUrl, user);
  }

  public updateUsuario(user: any): Observable<any> {
    const userId = user.id;
    console.log('Trabajador actualizado');
    return this.http.post(`${this.apiUrl}/${userId}`, user);
  }

  public deleteUsuario(idUsuario: any) {
    console.log('Trabajador eliminado');
  }

}

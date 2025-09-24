import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private http = inject(HttpClient);
  private apiUrl = 'api_url/estudiantes';

  public createStudent(student: any): Observable<any> {
    console.log('Estudiante creado');
    return this.http.post(this.apiUrl, student);
  }

  public updateStudent(student: any): Observable<any> {
    const studentId = student.id;
    console.log('Estudiante actualizado');
    return this.http.post(`${this.apiUrl}/${studentId}`, student);
  }

  public deleteStudent(idStudent: any) {
    console.log('Estudiante eliminado');
  }

}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { calendarEvents } from '../components/utils/data';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private http = inject(HttpClient);
  private apiUrl = 'tu_api_url/lessons'; // Reemplaza con la URL de tu API
  private lessonsDataSample = calendarEvents;

  getLessons(type: 'teacherId' | 'classId', id: string | number): any { // Observable<apiLesson[]>
    // Construye el endpoint de la API dinámicamente
    const endpoint = `${this.apiUrl}?${type}=${id}`;
    // return this.http.get<any[]>(endpoint);
    return this.lessonsDataSample;
  }
}
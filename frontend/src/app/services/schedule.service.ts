// services/schedule.service.ts
import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';
import { Lesson } from '../models/lesson.model';
import { MOCK_LESSONS } from '../components/schedule/mock-lessons';

const FAKE: Lesson[] = [
  { id: '1', title: 'T_PDG45_90[BPA] – Martín Alonso', start: new Date(0,0,1, 8, 0), end: new Date(0,0,1, 8,45) },
  { id: '2', title: 'PT_PDG60_120[BPA] – Sofía Benítez', start: new Date(0,0,1, 9, 0), end: new Date(0,0,1,10, 0) },
  { id: '3', title: 'T_PDG45_90[BPA] – Valeria Ramírez', start: new Date(0,0,1,15, 0), end: new Date(0,0,1,15,45) },
];

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  getLessons() {
    return of(MOCK_LESSONS).pipe(delay(400)); // simula red
  }
}
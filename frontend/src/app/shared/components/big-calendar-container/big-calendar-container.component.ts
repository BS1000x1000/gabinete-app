import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map, of } from 'rxjs';

// Importa los componentes y servicios necesarios
import { BigCalendarComponent } from '../big-calendar/big-calendar.component';
import { ScheduleService } from '../../../services/schedule.service';
import { BrowserModule } from '@angular/platform-browser';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { lessonsData, mockLessons } from '../utils/data';

// Define las interfaces para la tipificación
interface Lesson {
  title: string;
  start: Date;
  end: Date;
}

interface ApiLesson {
  id: string; // Asume que la API devuelve un ID
  name: string;
  startTime: string; // Asume que las fechas vienen como strings
  endTime: string;
}

@Component({
  selector: 'app-big-calendar-container',
  standalone: true,
  imports: [
    CommonModule,
    BigCalendarComponent, 
  ],
  templateUrl: './big-calendar-container.component.html',
  styleUrl: './big-calendar-container.component.scss'
})
export class BigCalendarContainerComponent implements OnInit, OnChanges {
  @Input() type: 'teacherId' | 'classId' = 'teacherId';
  @Input() id: string | number = '';

  private scheduleService = inject(ScheduleService);
  schedule$!: Observable<Lesson[]>;

  dataPrueba = lessonsData

  constructor() {}

  ngOnInit(): void {
    // La carga de datos se realiza en OnInit y OnChanges
    this.loadSchedule();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si los inputs (type o id) cambian, recarga el calendario
    if (changes['type'] || changes['id']) {
      this.loadSchedule();
    }
  }

  // private loadSchedule(): void {
  //   this.schedule$ = this.scheduleService.getLessons(this.type, this.id).pipe(
  //     map((apiLessons: any) => {
  //       // Mapea los datos de la API al formato que necesita el calendario
  //       const mappedLessons: Lesson[] = apiLessons.map((lesson: any) => ({
  //         title: lesson.name,
  //         start: lesson.startTime,
  //         end: lesson.endTime,
  //       }));
        
  //       // Aplica la lógica de ajuste de horario
  //       return this.adjustScheduleToCurrentWeek(mappedLessons);
  //     })
  //   );
  // }
  

  private adjustScheduleToCurrentWeek(lessons: Lesson[]): Lesson[] {
    // Lógica para ajustar las fechas a la semana actual
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const daysFromMonday = (currentDayOfWeek + 6) % 7;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);
    
    return lessons.map(lesson => {
      const lessonDayOfWeek = new Date(lesson.start).getDay();
      const newStart = new Date(startOfWeek);
      newStart.setDate(startOfWeek.getDate() + (lessonDayOfWeek + 6) % 7);
      newStart.setHours(new Date(lesson.start).getHours(), new Date(lesson.start).getMinutes());
      
      const newEnd = new Date(startOfWeek);
      newEnd.setDate(startOfWeek.getDate() + (lessonDayOfWeek + 6) % 7);
      newEnd.setHours(new Date(lesson.end).getHours(), new Date(lesson.end).getMinutes());

      return {
        ...lesson,
        start: newStart,
        end: newEnd,
      };
    });
  }

  private loadSchedule() {
    this.schedule$ = of(mockLessons).pipe(
      map(apiLessons => {
        const mappedLessons: Lesson[] = apiLessons.map(lesson => ({
          title: lesson.name,
          start: new Date(lesson.startTime),
          end: new Date(lesson.endTime),
        }));
        
        return this.adjustScheduleToCurrentWeek(mappedLessons);
      })
    );
  }
}
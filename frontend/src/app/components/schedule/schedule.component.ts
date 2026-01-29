// schedule.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarView, CalendarEvent } from 'angular-calendar';
import { Lesson } from '../../models/lesson.model';
import { ScheduleService } from '../../services/schedule.service';
import { WEEK_START_HOUR, WEEK_END_HOUR } from '../../utils/date';
import { TurnosService } from '../../services/turnos.service';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  private service = inject(ScheduleService);

  /* ---------- entradas ---------- */
  @Input() type: 'trabajadorId' | 'classId' = 'trabajadorId';
  @Input() id: string | number = '';
  @Input() startHour = WEEK_START_HOUR;
  @Input() endHour = WEEK_END_HOUR;

  /* ---------- estado ---------- */
  viewDate = signal(new Date());
  view = signal<CalendarView>(CalendarView.Week);
  lessons = signal<Lesson[]>([]);
  private turnosSvc = inject(TurnosService);
  turnos = this.turnosSvc.turnos;

  events = computed<CalendarEvent[]>(() =>
    this.turnos().map((l) => ({
      title: l.tipoSesion,
      start: new Date(l.fechaHoraInicio),
      end: new Date(l.fechaHoraFin),
      color: { primary: '#0d6efd', secondary: '#cfe2ff' },
      meta: { id: l.id },
    }))
  );

  readonly CalendarView = CalendarView; // template

  ngOnInit() {
    this.load();
  }

  setView(v: CalendarView) {
    this.view.set(v);
  }

  private load() {
    console.log(this.turnos());
    this.service.getLessons().subscribe(
      (raw) => this.lessons.set(raw) // ← fechas ya están en la semana actual
    );
  }
}

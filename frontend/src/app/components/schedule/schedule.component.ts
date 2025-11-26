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
  @Input() type: 'teacherId' | 'classId' = 'teacherId';
  @Input() id: string | number = '';
  @Input() startHour = WEEK_START_HOUR;
  @Input() endHour = WEEK_END_HOUR;

  /* ---------- estado ---------- */
  viewDate = signal(new Date());
  view = signal<CalendarView>(CalendarView.Week);
  lessons = signal<Lesson[]>([]);

  events = computed<CalendarEvent[]>(() =>
    this.lessons().map((l) => ({
      title: l.title,
      start: l.start,
      end: l.end,
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
    this.service.getLessons().subscribe(
      (raw) => this.lessons.set(raw) // ← fechas ya están en la semana actual
    );
  }
}

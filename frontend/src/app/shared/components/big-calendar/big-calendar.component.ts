import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, CalendarView } from 'angular-calendar';
import { CalendarEvent, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { startOfDay, endOfDay, setHours, setMinutes } from 'date-fns';

@Component({
  selector: 'app-big-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule
  ],
  templateUrl: './big-calendar.component.html',
  styleUrl: './big-calendar.component.scss',
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
  ],
  // encapsulation: ViewEncapsulation.None // Para que los estilos de la librería funcionen
})
export class BigCalendarComponent implements OnInit {
  @Input() data: { title: string; start: Date; end: Date }[] = [];

    // Exponemos el enum al template
  public CalendarView = CalendarView; // <-- Añade esta línea
  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];

  // Definir los horarios mínimos y máximos
  minHour = setMinutes(setHours(new Date(), 8), 0);
  maxHour = setMinutes(setHours(new Date(), 17), 0);

  ngOnInit() {
    this.events = this.data.map(event => ({
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end)
    }));
  }

  // Método para cambiar la vista
  setView(view: CalendarView) {
    this.view = view;
  }
}
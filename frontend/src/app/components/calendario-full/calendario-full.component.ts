import { Component, signal, ViewChild, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent as FullCalendarLib } from '@fullcalendar/angular';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import esLocale from '@fullcalendar/core/locales/es';
import { SesionesService } from '../../services/sesiones.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendario-full',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, ConfirmModalComponent],
  templateUrl: './calendario-full.component.html'
})
export class CalendarioFullComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarLib;

  private sesionesSvc = inject(SesionesService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isLoading = signal(false);
  eventos = signal<EventInput[]>([]);

  pendingAction = signal<(() => void) | null>(null);
  pendingRevert = signal<(() => void) | null>(null);
  confirmMsg    = signal('');

  // ✅ PALETA DE COLORES (usando tu paleta)
  private readonly COLORES = {
    // Primarios
    primary: '#7c6fd6',
    primaryDark: '#5a4fa8',
    primaryLight: '#e8e4f8',
    
    secondary: '#5a9de8',
    secondaryDark: '#3d7bc4',
    
    // Semánticos
    success: '#10b981',
    successDark: '#059669',
    
    warning: '#f59e0b',
    warningDark: '#d97706',
    
    danger: '#ef4444',
    dangerDark: '#dc2626',
    
    info: '#3b82f6',
    
    // Colores pastel
    lilaSuave: '#c8bce8',
    azulBebe: '#adc9f6',
    
    // Grises
    gray400: '#9ca3af',
    gray500: '#6b7280',
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'timeGridWeek',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    height: 'auto',
    slotMinTime: '08:00:00',
    slotMaxTime: '21:00:00',
    slotDuration: '00:15:00',
    slotLabelInterval: '01:00',
    allDaySlot: false,
    nowIndicator: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    weekends: true,
    firstDay: 1,
    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5],
      startTime: '09:00',
      endTime: '19:00'
    },
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    datesSet: this.handleDatesSet.bind(this),
    events: []
  };

  ngOnInit() {
    this.cargarEventos();
  }

  cargarEventos() {
    this.isLoading.set(true);

    const calendarApi = this.calendarComponent?.getApi();
    const view = calendarApi?.view;
    
    let fechaInicio: string;
    let fechaFin: string;

    if (view) {
      fechaInicio = this.formatearFechaISO(view.activeStart);
      fechaFin = this.formatearFechaISO(view.activeEnd);
    } else {
      const hoy = new Date();
      const inicio = new Date(hoy);
      inicio.setDate(hoy.getDate() - hoy.getDay() + 1);
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);

      fechaInicio = this.formatearFechaISO(inicio);
      fechaFin = this.formatearFechaISO(fin);
    }

    console.log('📅 Cargando eventos del', fechaInicio, 'al', fechaFin);

    this.sesionesSvc.getSesionesByTrabajador(
      fechaInicio, 
      fechaFin
    ).subscribe({
      next: (sesiones) => {
        const eventos: EventInput[] = sesiones.map(s => ({
          id: s.id,
          title: `${s.cliente.nombre} ${s.cliente.apellidos}`,
          start: s.fechaHoraInicio,
          end: s.fechaHoraFin,
          backgroundColor: this.getColorEstado(s.estado),
          borderColor: this.getColorTipo(s.tipoSesion),
          textColor: '#fff',
          extendedProps: {
            clienteId: s.clienteId,
            estado: s.estado,
            tipoSesion: s.tipoSesion,
            notas: s.notas,
            curso: s.cliente?.curso
          }
        }));

        this.eventos.set(eventos);
        this.calendarOptions.events = eventos;
        this.isLoading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar eventos:', err);
        this.isLoading.set(false);
      }
    });
  }

  handleEventClick(clickInfo: EventClickArg) {
    const clienteId = clickInfo.event.extendedProps['clienteId'];
    console.log('🔵 Click en evento:', clickInfo.event.title);
    this.router.navigate(['/home/listado', clienteId, 'cliente']);
  }

  handleEventDrop(info: any) {
    const fecha = new Date(info.event.start).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    this.confirmMsg.set(`¿Mover "${info.event.title}" al ${fecha}?`);
    this.pendingAction.set(() => { /* la acción de guardado irá aquí */ });
    this.pendingRevert.set(() => info.revert());
  }

  handleEventResize(info: any) {
    this.confirmMsg.set(`¿Cambiar la duración de "${info.event.title}"?`);
    this.pendingAction.set(() => { /* la acción de guardado irá aquí */ });
    this.pendingRevert.set(() => info.revert());
  }

  onConfirmado() { this.pendingAction()?.(); this.pendingAction.set(null); this.pendingRevert.set(null); }
  onCancelado()  { this.pendingRevert()?.(); this.pendingAction.set(null); this.pendingRevert.set(null); }

  handleDatesSet(dateInfo: any) {
    console.log('📅 Rango visible:', dateInfo.startStr, '-', dateInfo.endStr);
    this.cargarEventos();
  }

  // ========================================
  // ✅ COLORES USANDO TU PALETA
  // ========================================

  /**
   * Colores por estado de sesión
   */
  private getColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      'PROGRAMADA': this.COLORES.primary,           // Lila
      'COMPLETADA': this.COLORES.success,           // Verde
      'CANCELADA_CON_AVISO': this.COLORES.warning,  // Naranja
      'CANCELADA_SIN_AVISO': this.COLORES.danger,   // Rojo
      'VACACIONES': this.COLORES.info               // Azul info
    };
    return colores[estado] || this.COLORES.gray500;
  }

  /**
   * Colores por tipo de sesión (para el borde)
   */
  private getColorTipo(tipo: string): string {
    const colores: Record<string, string> = {
      'PEDAGOGIA': this.COLORES.primary,           // Lila
      'NEUROPSICOLOGIA': this.COLORES.secondary,   // Azul
      'EVALUACION': this.COLORES.warning,          // Naranja
      'REUNION_COLEGIO': this.COLORES.success      // Verde
    };
    return colores[tipo] || this.COLORES.gray500;
  }

  private formatearFechaISO(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }
}
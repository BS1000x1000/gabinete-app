import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FestivosService } from '../../../../../services/festivos.service';
import { Festivo } from '../../../../../interface/festivo.interface';
import { PeriodoVacaciones } from '../../../../../interface/vacaciones.interface';

interface DiaCalendario {
  fecha: string;
  numero: number;
  fuera: boolean;
  esFestivo: boolean;
  festivoDesc: string;
  esVacExistente: boolean;
  esHoy: boolean;
}

@Component({
  selector: 'app-vac-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vac-picker.component.html',
})
export class VacPickerComponent implements OnInit {
  private festivosSvc = inject(FestivosService);
  private destroyRef = inject(DestroyRef);

  readonly vacaciones = input<PeriodoVacaciones[]>([]);
  readonly rangoChange = output<{ fechaInicio: string; fechaFin: string } | null>();

  private mesMostrado = signal(new Date());
  private festivosCargados = signal<Festivo[]>([]);
  private aniosCargados = new Set<number>();

  readonly rangoInicio = signal<string | null>(null);
  readonly rangoFin = signal<string | null>(null);
  private hoverDate = signal<string | null>(null);
  readonly errorPicker = signal<string | null>(null);

  readonly DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  readonly mesLabel = computed(() =>
    this.mesMostrado().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
  );

  readonly festivosPorFecha = computed(() => {
    const map = new Map<string, string>();
    for (const f of this.festivosCargados()) {
      map.set(this.toDateStr(new Date(f.fecha)), f.descripcion);
    }
    return map;
  });

  readonly vacDates = computed(() => {
    const set = new Set<string>();
    for (const v of this.vacaciones()) {
      const cur = this.localDate(v.fechaInicio);
      const end = this.localDate(v.fechaFin);
      while (cur <= end) {
        set.add(this.toDateStr(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }
    return set;
  });

  readonly dias = computed<DiaCalendario[]>(() => {
    const d = this.mesMostrado();
    const anio = d.getFullYear();
    const mes = d.getMonth();
    const hoy = this.toDateStr(new Date());
    const festivos = this.festivosPorFecha();
    const vacDates = this.vacDates();

    const primero = new Date(anio, mes, 1);
    const ultimo = new Date(anio, mes + 1, 0);
    const offsetInicio = (primero.getDay() + 6) % 7;

    const result: DiaCalendario[] = [];

    for (let i = offsetInicio; i > 0; i--) {
      const fecha = new Date(anio, mes, 1 - i);
      const fechaStr = this.toDateStr(fecha);
      result.push({ fecha: fechaStr, numero: fecha.getDate(), fuera: true,
        esFestivo: festivos.has(fechaStr), festivoDesc: festivos.get(fechaStr) ?? '',
        esVacExistente: vacDates.has(fechaStr), esHoy: fechaStr === hoy });
    }

    for (let day = 1; day <= ultimo.getDate(); day++) {
      const fecha = new Date(anio, mes, day);
      const fechaStr = this.toDateStr(fecha);
      result.push({ fecha: fechaStr, numero: day, fuera: false,
        esFestivo: festivos.has(fechaStr), festivoDesc: festivos.get(fechaStr) ?? '',
        esVacExistente: vacDates.has(fechaStr), esHoy: fechaStr === hoy });
    }

    let trailing = 1;
    while (result.length < 42) {
      const fecha = new Date(anio, mes + 1, trailing++);
      const fechaStr = this.toDateStr(fecha);
      result.push({ fecha: fechaStr, numero: fecha.getDate(), fuera: true,
        esFestivo: festivos.has(fechaStr), festivoDesc: festivos.get(fechaStr) ?? '',
        esVacExistente: vacDates.has(fechaStr), esHoy: fechaStr === hoy });
    }

    return result;
  });

  private efectiveFin = computed(() => {
    const fin = this.rangoFin();
    if (fin) return fin;
    const inicio = this.rangoInicio();
    const hover = this.hoverDate();
    return inicio && hover && hover >= inicio ? hover : null;
  });

  isDiaInicio(fecha: string): boolean { return this.rangoInicio() === fecha; }
  isDiaFin(fecha: string): boolean { return this.efectiveFin() === fecha; }
  isDiaEnRango(fecha: string): boolean {
    const i = this.rangoInicio(), f = this.efectiveFin();
    return !!(i && f && fecha > i && fecha < f);
  }

  clickDia(dia: DiaCalendario): void {
    if (dia.fuera || dia.esFestivo) return;
    this.errorPicker.set(null);

    const inicio = this.rangoInicio();
    const fin = this.rangoFin();

    if (!inicio || fin) {
      this.rangoInicio.set(dia.fecha);
      this.rangoFin.set(null);
      this.hoverDate.set(null);
      this.rangoChange.emit(null);
      return;
    }

    const nuevoInicio = dia.fecha < inicio ? dia.fecha : inicio;
    const nuevoFin = dia.fecha < inicio ? inicio : dia.fecha;

    const festivos = this.festivosPorFecha();
    const conflictos = this.enumerarRango(nuevoInicio, nuevoFin).filter(f => festivos.has(f));
    if (conflictos.length > 0) {
      const nombres = conflictos.slice(0, 2).map(f => festivos.get(f)!).join(', ');
      this.errorPicker.set(`El rango incluye festivos: ${nombres}. Ajusta la selección.`);
      this.rangoInicio.set(dia.fecha);
      this.rangoFin.set(null);
      return;
    }

    this.rangoInicio.set(nuevoInicio);
    this.rangoFin.set(nuevoFin);
    this.hoverDate.set(null);
    this.rangoChange.emit({ fechaInicio: nuevoInicio, fechaFin: nuevoFin });
  }

  onMouseEnter(dia: DiaCalendario): void {
    if (this.rangoInicio() && !this.rangoFin()) this.hoverDate.set(dia.fecha);
  }

  onMouseLeave(): void { this.hoverDate.set(null); }

  limpiar(): void {
    this.rangoInicio.set(null);
    this.rangoFin.set(null);
    this.hoverDate.set(null);
    this.errorPicker.set(null);
    this.rangoChange.emit(null);
  }

  mesAnterior(): void {
    const d = new Date(this.mesMostrado());
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    this.mesMostrado.set(d);
    this.cargarFestivos();
  }

  mesSiguiente(): void {
    const d = new Date(this.mesMostrado());
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    this.mesMostrado.set(d);
    this.cargarFestivos();
  }

  ngOnInit(): void { this.cargarFestivos(); }

  private cargarFestivos(): void {
    const anio = this.mesMostrado().getFullYear();
    if (this.aniosCargados.has(anio)) return;
    this.festivosSvc.getFestivosParaAgenda(anio)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: festivos => {
          this.aniosCargados.add(anio);
          this.festivosCargados.update(existing => [
            ...existing.filter(f => f.anio !== anio),
            ...festivos,
          ]);
        },
      });
  }

  readonly rangoLabel = computed(() => {
    const inicio = this.rangoInicio();
    const fin = this.rangoFin();
    if (!inicio) return '';
    if (!fin) return `Desde: ${this.fmt(inicio)}`;
    const dias = Math.round((new Date(fin + 'T12:00:00').getTime() - new Date(inicio + 'T12:00:00').getTime()) / 86_400_000) + 1;
    return `${this.fmt(inicio)} → ${this.fmt(fin)} · ${dias} día${dias !== 1 ? 's' : ''}`;
  });

  fmt(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  private toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private localDate(iso: string): Date {
    const d = new Date(iso);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private enumerarRango(inicio: string, fin: string): string[] {
    const result: string[] = [];
    const cur = new Date(inicio + 'T12:00:00');
    const end = new Date(fin + 'T12:00:00');
    while (cur <= end) { result.push(this.toDateStr(cur)); cur.setDate(cur.getDate() + 1); }
    return result;
  }
}

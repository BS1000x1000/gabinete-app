import { Injectable } from '@nestjs/common';
import { calcularDomingoPascua } from '../common/utils/pascua';
import { esFestivo, generarFechasRecurrentes } from '../contratos/contratos.utils';

/**
 * Tabla de sesiones previstas del curso, la que va en la clausula 4 del
 * contrato.
 *
 * El gabinete tenia dos plantillas de contrato a mano, una para las familias de
 * lunes y otra para las de viernes, identicas salvo esta tabla. Calcularla
 * quita ese mantenimiento y de paso permite cualquier dia de la semana, no solo
 * esos dos.
 */

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/** Un curso va de septiembre a julio; agosto no se factura ni se presta. */
export const MES_INICIO_CURSO = 8;  // septiembre (base 0)
export const MES_FIN_CURSO = 6;     // julio (base 0)

export interface DiaCalendario {
  dia: number;
  haySesion: boolean;
  motivo?: string;
}

export interface FilaCalendario {
  mes: string;
  anio: number;
  mesNumero: number;
  dias: DiaCalendario[];
  /** Los dias tal cual salen impresos: "7 - 14 - 21 - 28". */
  diasTexto: string;
  observaciones: string[];
}

export interface CursoEscolar {
  /** Anio en que arranca el curso: 2026 para el curso 2026-2027. */
  anioInicio: number;
}

type FestivoMin = { fecha: Date; descripcion: string };

@Injectable()
export class CalendarioContratoService {
  /**
   * Dias del periodo navideno sin servicio. El 25 de diciembre, el 1 y el 6 de
   * enero NO estan aqui: son festivos, y el contrato distingue expresamente
   * entre "festivo" y "periodo vacacional".
   */
  private diasNavidad(anio: number): Date[] {
    return [24, 28, 29, 30, 31].map(d => new Date(anio, 11, d, 12, 0, 0, 0));
  }

  /**
   * Lunes, martes y miercoles de Semana Santa. Jueves y Viernes Santo quedan
   * fuera porque son festivos, no vacaciones.
   */
  private diasSemanaSanta(anio: number): Date[] {
    const pascua = calcularDomingoPascua(anio);
    return [6, 5, 4].map(
      resta => new Date(anio, pascua.getMonth(), pascua.getDate() - resta, 12, 0, 0, 0),
    );
  }

  /** Periodos que el propio contrato declara sin servicio, para un curso. */
  periodosSinServicio(curso: CursoEscolar): Array<{ fecha: Date; motivo: string }> {
    const { anioInicio } = curso;
    const anioFin = anioInicio + 1;
    return [
      ...this.diasNavidad(anioInicio).map(fecha => ({
        fecha,
        motivo: 'No se presta servicio en el periodo navideño',
      })),
      ...this.diasSemanaSanta(anioFin).map(fecha => ({
        fecha,
        motivo: 'No se presta servicio durante la semana completa de Semana Santa',
      })),
    ];
  }

  /**
   * Construye la tabla del curso para un dia de la semana.
   *
   * `diaSemanaISO` es 1=Lunes..7=Domingo, la convencion de `ContratoSlot`.
   * Ojo: `DisponibilidadService` usa 0=Domingo; leer de ahi desfasa un dia.
   */
  construirTabla(
    diaSemanaISO: number,
    curso: CursoEscolar,
    festivos: FestivoMin[],
  ): FilaCalendario[] {
    const { anioInicio } = curso;
    const desde = new Date(anioInicio, MES_INICIO_CURSO, 1, 12, 0, 0, 0);
    const hasta = new Date(anioInicio + 1, MES_FIN_CURSO + 1, 0, 12, 0, 0, 0);

    const sinServicio = this.periodosSinServicio(curso);
    const fechas = generarFechasRecurrentes(desde, hasta, diaSemanaISO);

    const filas = new Map<string, FilaCalendario>();

    for (const fecha of fechas) {
      const clave = `${fecha.getFullYear()}-${fecha.getMonth()}`;

      if (!filas.has(clave)) {
        filas.set(clave, {
          mes: MESES[fecha.getMonth()],
          anio: fecha.getFullYear(),
          mesNumero: fecha.getMonth() + 1,
          dias: [],
          diasTexto: '',
          observaciones: [],
        });
      }
      const fila = filas.get(clave)!;

      const festivo = festivos.find(f => this.mismoDia(fecha, f.fecha));
      const vacacion = sinServicio.find(p => this.mismoDia(fecha, p.fecha));

      if (festivo) {
        fila.dias.push({ dia: fecha.getDate(), haySesion: false, motivo: festivo.descripcion });
        fila.observaciones.push(`${fecha.getDate()}: No hay sesión. ${festivo.descripcion}`);
      } else if (vacacion) {
        fila.dias.push({ dia: fecha.getDate(), haySesion: false, motivo: vacacion.motivo });
        fila.observaciones.push(`${fecha.getDate()}: No hay sesión. ${vacacion.motivo}`);
      } else {
        fila.dias.push({ dia: fecha.getDate(), haySesion: true });
      }
    }

    return [...filas.values()].map(fila => ({
      ...fila,
      diasTexto: fila.dias.map(d => d.dia).join(' - '),
      observaciones: fila.observaciones.length
        ? fila.observaciones
        : ['Sin festivos que afecten'],
    }));
  }

  /**
   * Las dos frases de la clausula 4 que citan fechas concretas.
   *
   * El contrato original las llevaba escritas a mano ("los dias 24, 28, 29, 30
   * y 31 de diciembre de 2026, retomandose la actividad el 4 de enero de
   * 2027"). Se conserva su redaccion literal y solo se calculan las fechas,
   * que es lo que caducaba cada curso.
   */
  textoPeriodosSinServicio(
    curso: CursoEscolar,
    festivos: FestivoMin[],
  ): { navidad: string; semanaSanta: string } {
    const { anioInicio } = curso;
    const anioFin = anioInicio + 1;

    const dias = this.diasNavidad(anioInicio).map(d => d.getDate());
    const navidadDias = `${dias.slice(0, -1).join(', ')} y ${dias[dias.length - 1]}`;
    const vuelta = this.primerDiaHabil(new Date(anioFin, 0, 1, 12, 0, 0, 0), festivos);

    const ss = this.diasSemanaSanta(anioFin).sort((a, b) => a.getDate() - b.getDate());
    const ssDias = `${ss[0].getDate()}, ${ss[1].getDate()} y ${ss[2].getDate()}`;
    const pascua = calcularDomingoPascua(anioFin);
    const lunesPascua = new Date(anioFin, pascua.getMonth(), pascua.getDate() + 1, 12, 0, 0, 0);

    return {
      navidad:
        `los días ${navidadDias} de diciembre de ${anioInicio}, retomándose la ` +
        `actividad el ${this.fechaLarga(vuelta)}`,
      semanaSanta:
        `los días ${ssDias} de ${MESES[ss[0].getMonth()].toLowerCase()} de ${anioFin}, ` +
        `retomándose la actividad el ${this.fechaLarga(lunesPascua)}`,
    };
  }

  /** Primer dia de diario que no sea festivo, a partir de `desde` incluido. */
  private primerDiaHabil(desde: Date, festivos: FestivoMin[]): Date {
    const d = new Date(desde);
    for (let i = 0; i < 31; i++) {
      const finDeSemana = d.getDay() === 0 || d.getDay() === 6;
      const esFestivo = festivos.some(f => this.mismoDia(d, f.fecha));
      if (!finDeSemana && !esFestivo) return d;
      d.setDate(d.getDate() + 1);
    }
    return d;
  }

  private fechaLarga(d: Date): string {
    return `${d.getDate()} de ${MESES[d.getMonth()].toLowerCase()} de ${d.getFullYear()}`;
  }

  /** Etiqueta del curso, "2026-2027". */
  etiquetaCurso(curso: CursoEscolar): string {
    return `${curso.anioInicio}-${curso.anioInicio + 1}`;
  }

  /** Cuantas sesiones se prestan de verdad en el curso. */
  totalSesiones(filas: FilaCalendario[]): number {
    return filas.reduce((n, f) => n + f.dias.filter(d => d.haySesion).length, 0);
  }

  /**
   * Curso al que pertenece una fecha de inicio de contrato. De agosto en
   * adelante es el curso que empieza ese ano; antes, el que empezo el anterior.
   */
  cursoDe(fecha: Date): CursoEscolar {
    return {
      anioInicio: fecha.getMonth() >= MES_INICIO_CURSO - 1
        ? fecha.getFullYear()
        : fecha.getFullYear() - 1,
    };
  }

  private mismoDia(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
}

// Reexportado para los tests y para quien solo necesite el predicado.
export { esFestivo };

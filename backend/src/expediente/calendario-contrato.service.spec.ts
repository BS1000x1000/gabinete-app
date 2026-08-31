import { CalendarioContratoService } from './calendario-contrato.service';

/**
 * Caso de oro: la tabla calculada debe salir identica a la de los contratos
 * que el gabinete venia rellenando a mano. Los valores esperados estan
 * copiados de los PDF originales (curso 2026-2027, familias de lunes y de
 * viernes), no derivados del propio codigo.
 */

const f = (a: number, m: number, d: number, descripcion: string) => ({
  fecha: new Date(a, m - 1, d, 12, 0, 0, 0),
  descripcion,
});

/**
 * Calendario oficial 2026-2027 de la Comunidad de Madrid.
 *
 * Ojo con los traslados: el 1 de noviembre de 2026 y el 6 de diciembre de 2026
 * caen en domingo y el decreto los mueve al lunes siguiente. Son justo los dos
 * que hacen que la tabla de los lunes tenga festivos, asi que si el import de
 * festivos no los traslada, el contrato sale mal.
 */
const FESTIVOS_MADRID = [
  f(2026, 10, 12, 'Fiesta Nacional de Espana'),
  f(2026, 11, 2, 'Fiesta de Todos los Santos'),
  f(2026, 12, 7, 'Dia de la Constitucion Espanola'),
  f(2026, 12, 8, 'Inmaculada Concepcion'),
  f(2026, 12, 25, 'Natividad del Senor'),
  f(2027, 1, 1, 'Ano Nuevo'),
  f(2027, 1, 6, 'Epifania del Senor'),
  f(2027, 3, 25, 'Jueves Santo'),
  f(2027, 3, 26, 'Viernes Santo'),
  f(2027, 5, 1, 'Fiesta del Trabajo'),
  f(2027, 5, 2, 'Fiesta de la Comunidad de Madrid'),
  f(2027, 7, 25, 'Santiago Apostol'),
];

const CURSO = { anioInicio: 2026 };

describe('CalendarioContratoService', () => {
  let service: CalendarioContratoService;

  beforeEach(() => {
    service = new CalendarioContratoService();
  });

  const tablaPorMes = (diaISO: number) => {
    const filas = service.construirTabla(diaISO, CURSO, FESTIVOS_MADRID);
    const out: Record<string, string> = {};
    for (const fila of filas) out[`${fila.mes} ${fila.anio}`] = fila.diasTexto;
    return out;
  };

  describe('tabla de los LUNES (contrato original)', () => {
    it('reproduce exactamente los dias del PDF', () => {
      expect(tablaPorMes(1)).toEqual({
        'Septiembre 2026': '7 - 14 - 21 - 28',
        'Octubre 2026': '5 - 12 - 19 - 26',
        'Noviembre 2026': '2 - 9 - 16 - 23 - 30',
        'Diciembre 2026': '7 - 14 - 21 - 28',
        'Enero 2027': '4 - 11 - 18 - 25',
        'Febrero 2027': '1 - 8 - 15 - 22',
        'Marzo 2027': '1 - 8 - 15 - 22 - 29',
        'Abril 2027': '5 - 12 - 19 - 26',
        'Mayo 2027': '3 - 10 - 17 - 24 - 31',
        'Junio 2027': '7 - 14 - 21 - 28',
        'Julio 2027': '5 - 12 - 19 - 26',
      });
    });

    it('marca sin sesion el 12 de octubre por la Fiesta Nacional', () => {
      const octubre = service
        .construirTabla(1, CURSO, FESTIVOS_MADRID)
        .find(fi => fi.mesNumero === 10 && fi.anio === 2026)!;
      expect(octubre.dias.find(d => d.dia === 12)!.haySesion).toBe(false);
      expect(octubre.observaciones[0]).toContain('12: No hay sesión');
      expect(octubre.observaciones[0]).toContain('Fiesta Nacional');
    });

    it('en diciembre pierde el 7 por festivo y el 28 por el periodo navideno', () => {
      const diciembre = service
        .construirTabla(1, CURSO, FESTIVOS_MADRID)
        .find(fi => fi.mesNumero === 12)!;
      expect(diciembre.dias.find(d => d.dia === 7)!.haySesion).toBe(false);
      expect(diciembre.dias.find(d => d.dia === 28)!.haySesion).toBe(false);
      expect(diciembre.dias.find(d => d.dia === 14)!.haySesion).toBe(true);
      expect(diciembre.observaciones).toHaveLength(2);
    });

    it('pierde el 22 de marzo por Semana Santa, y el 29 ya es lectivo', () => {
      const marzo = service
        .construirTabla(1, CURSO, FESTIVOS_MADRID)
        .find(fi => fi.mesNumero === 3)!;
      expect(marzo.dias.find(d => d.dia === 22)!.haySesion).toBe(false);
      expect(marzo.dias.find(d => d.dia === 29)!.haySesion).toBe(true);
    });
  });

  describe('tabla de los VIERNES (contrato original)', () => {
    it('reproduce exactamente los dias del PDF', () => {
      expect(tablaPorMes(5)).toEqual({
        'Septiembre 2026': '4 - 11 - 18 - 25',
        'Octubre 2026': '2 - 9 - 16 - 23 - 30',
        'Noviembre 2026': '6 - 13 - 20 - 27',
        'Diciembre 2026': '4 - 11 - 18 - 25',
        'Enero 2027': '1 - 8 - 15 - 22 - 29',
        'Febrero 2027': '5 - 12 - 19 - 26',
        'Marzo 2027': '5 - 12 - 19 - 26',
        'Abril 2027': '2 - 9 - 16 - 23 - 30',
        'Mayo 2027': '7 - 14 - 21 - 28',
        'Junio 2027': '4 - 11 - 18 - 25',
        'Julio 2027': '2 - 9 - 16 - 23 - 30',
      });
    });

    it('los meses sin festivo se anotan como tales', () => {
      const filas = service.construirTabla(5, CURSO, FESTIVOS_MADRID);
      const octubre = filas.find(fi => fi.mesNumero === 10)!;
      expect(octubre.observaciones).toEqual(['Sin festivos que afecten']);
    });

    it('pierde el 25 de diciembre y el 1 de enero, que son festivos', () => {
      const filas = service.construirTabla(5, CURSO, FESTIVOS_MADRID);
      expect(
        filas.find(fi => fi.mesNumero === 12)!.dias.find(d => d.dia === 25)!.haySesion,
      ).toBe(false);
      expect(
        filas.find(fi => fi.mesNumero === 1)!.dias.find(d => d.dia === 1)!.haySesion,
      ).toBe(false);
    });

    it('pierde el Viernes Santo, que cae el 26 de marzo de 2027', () => {
      const marzo = service
        .construirTabla(5, CURSO, FESTIVOS_MADRID)
        .find(fi => fi.mesNumero === 3)!;
      expect(marzo.dias.find(d => d.dia === 26)!.haySesion).toBe(false);
      expect(marzo.observaciones[0]).toContain('Viernes Santo');
    });
  });

  describe('cualquier otro dia de la semana', () => {
    it('tambien produce tabla (el gabinete solo tenia plantilla de lunes y viernes)', () => {
      for (const dia of [2, 3, 4]) {
        const filas = service.construirTabla(dia, CURSO, FESTIVOS_MADRID);
        expect(filas).toHaveLength(11);
        expect(service.totalSesiones(filas)).toBeGreaterThan(30);
      }
    });

    it('el miercoles de Semana Santa (24 de marzo) no tiene sesion', () => {
      const marzo = service
        .construirTabla(3, CURSO, FESTIVOS_MADRID)
        .find(fi => fi.mesNumero === 3)!;
      expect(marzo.dias.find(d => d.dia === 24)!.haySesion).toBe(false);
    });
  });

  describe('periodos sin servicio', () => {
    it('navidad son el 24 y del 28 al 31, no el 25', () => {
      const dias = service
        .periodosSinServicio(CURSO)
        .filter(p => p.fecha.getMonth() === 11)
        .map(p => p.fecha.getDate());
      expect(dias).toEqual([24, 28, 29, 30, 31]);
    });

    it('semana santa son lunes, martes y miercoles previos a Pascua', () => {
      const dias = service
        .periodosSinServicio(CURSO)
        .filter(p => p.fecha.getMonth() === 2)
        .map(p => p.fecha.getDate())
        .sort((a, b) => a - b);
      expect(dias).toEqual([22, 23, 24]);
    });
  });

  describe('cursoDe()', () => {
    it('septiembre en adelante abre curso', () => {
      expect(service.cursoDe(new Date(2026, 8, 15))).toEqual({ anioInicio: 2026 });
    });

    it('antes de septiembre pertenece al curso anterior', () => {
      expect(service.cursoDe(new Date(2027, 1, 10))).toEqual({ anioInicio: 2026 });
    });
  });

  describe('curso siguiente', () => {
    it('recalcula sin tocar codigo: 2027-2028 con Pascua distinta', () => {
      const filas = service.construirTabla(1, { anioInicio: 2027 }, []);
      expect(filas).toHaveLength(11);
      // Pascua 2028 cae el 16 de abril: la Semana Santa se mueve a abril.
      const abril = filas.find(fi => fi.mesNumero === 4)!;
      expect(abril.dias.find(d => d.dia === 10)!.haySesion).toBe(false);
    });
  });
});

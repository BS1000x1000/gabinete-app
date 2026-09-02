import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AmbitoFestivo } from '@prisma/client';
import { CreateFestivoDto } from './dto/create-festivo.dto';
import { UpdateFestivoDto } from './dto/update-festivo.dto';
import { ConfiguracionCentroDto } from './dto/configuracion-centro.dto';
import { calcularViernesSanto, calcularDomingoPascua } from '../common/utils/pascua';
import { diaDesdeIso, normalizarDia } from '../common/fecha/dia.utils';
import {
  AUTONOMICOS,
  LOCALES,
  ANIOS_VERIFICADOS,
  nombreCcaa,
  contarDiasLocales,
  type DiaFijo,
  type DiaMovil,
} from './data/calendarios';

const FESTIVOS_FIJOS = [
  { mes: 1,  dia: 1,  descripcion: 'Año Nuevo' },
  { mes: 1,  dia: 6,  descripcion: 'Epifanía del Señor' },
  { mes: 5,  dia: 1,  descripcion: 'Fiesta del Trabajo' },
  { mes: 8,  dia: 15, descripcion: 'Asunción de la Virgen' },
  { mes: 10, dia: 12, descripcion: 'Fiesta Nacional de España' },
  { mes: 11, dia: 1,  descripcion: 'Todos los Santos' },
  { mes: 12, dia: 6,  descripcion: 'Día de la Constitución Española' },
  { mes: 12, dia: 8,  descripcion: 'Inmaculada Concepción' },
  { mes: 12, dia: 25, descripcion: 'Natividad del Señor' },
];

/** Lo minimo que necesita quien solo pregunta "que dias cierra el centro". */
export type FestivoMin = { fecha: Date; descripcion: string };

const ID_CENTRO = 'centro';

// Los helpers de dia natural nacieron aqui, pero no son de festivos: los
// necesita todo campo que represente un DIA y no un momento (vacaciones, la
// fecha de un registro diario). Viven en `common/fecha` y se reexporta
// `normalizarDia` porque medio modulo —y su spec— ya lo importaban de aqui.
export { normalizarDia };

/**
 * Un festivo nacional que cae en domingo se traslada al lunes siguiente
 * (art. 37.2 del Estatuto de los Trabajadores).
 *
 * Importa mas de lo que parece: la tabla de sesiones del contrato se calcula
 * sobre estos festivos, y en el curso 2026-2027 son justo los dos traslados
 * (1-nov y 6-dic de 2026, ambos domingo) los que hacen que las familias de
 * lunes pierdan sesion. Sin trasladar, el contrato saldria con dos sesiones de
 * mas.
 *
 * Es la regla general; algun ano el decreto autonomico puede resolverlo de otro
 * modo, y para eso esta el alta manual de festivos.
 */
function trasladarSiDomingo(fecha: Date): { fecha: Date; trasladado: boolean } {
  if (fecha.getUTCDay() !== 0) return { fecha, trasladado: false };
  const lunes = new Date(fecha);
  lunes.setUTCDate(lunes.getUTCDate() + 1);
  return { fecha: lunes, trasladado: true };
}

export interface ResultadoImportacion {
  importados: number;
  omitidos: number;
  /** Municipios declarados en el catalogo pero todavia sin festivos cargados. */
  sinDatos: string[];
  /** El ano no lo ha revisado nadie contra el BOCM ni los bandos municipales. */
  sinVerificar: boolean;
}

@Injectable()
export class FestivosService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // CONFIGURACION DEL CENTRO
  // ============================================================

  /**
   * El calendario que rige el centro. Fila unica; si falta —base recien
   * migrada, o restaurada de un backup anterior— se crea con el minimo que no
   * miente: comunidad de Madrid y ningun municipio, porque los festivos locales
   * no se adivinan.
   */
  async getConfiguracion() {
    const cfg = await this.prisma.configuracionCentro.findUnique({ where: { id: ID_CENTRO } });
    if (cfg) return cfg;
    return this.prisma.configuracionCentro.create({
      data: { id: ID_CENTRO, ccaaCodigo: 'MAD', municipio: '', provincia: 'Madrid' },
    });
  }

  async setConfiguracion(dto: ConfiguracionCentroDto) {
    const municipio = dto.municipio?.trim() ?? '';
    if (municipio && !LOCALES[municipio]) {
      throw new BadRequestException(
        `El municipio "${municipio}" no esta en el catalogo. Anadelo en festivos/data/calendarios.ts.`,
      );
    }
    const provincia = municipio ? LOCALES[municipio].provincia : (dto.provincia?.trim() || '');

    return this.prisma.configuracionCentro.upsert({
      where:  { id: ID_CENTRO },
      update: { ccaaCodigo: dto.ccaaCodigo, municipio, provincia },
      create: { id: ID_CENTRO, ccaaCodigo: dto.ccaaCodigo, municipio, provincia },
    });
  }

  // ============================================================
  // CONSULTA
  // ============================================================

  /**
   * Los dias que cierra el centro en los anos dados. **Unica fuente.**
   *
   * Antes esta query estaba copiada en `contratos.service`,
   * `contratos-replanificacion.service` y `contratos-pdf.service`, y las tres
   * la resolvian contra `Cliente.provincia`: texto libre contra texto libre. Un
   * festivo que no casara desaparecia en silencio y el contrato salia con una
   * sesion de mas — un documento que firma la familia y que fija una cuota.
   *
   * El ambito LOCAL casa solo por municipio, no por municipio + CCAA: la CCAA de
   * un municipio ya la fija el catalogo, y exigir las dos reintroduce la clase
   * de fallo que esto viene a quitar.
   */
  async delCentro(anios: number[]): Promise<FestivoMin[]> {
    if (anios.length === 0) return [];
    const cfg = await this.getConfiguracion();

    const ambitos: any[] = [
      { ambito: AmbitoFestivo.NACIONAL },
      { ambito: AmbitoFestivo.AUTONOMICO, ccaa: cfg.ccaaCodigo },
    ];
    if (cfg.municipio) {
      ambitos.push({ ambito: AmbitoFestivo.LOCAL, municipio: cfg.municipio });
    }

    return this.prisma.festivo.findMany({
      where: { anio: { in: anios }, OR: ambitos },
      select: { fecha: true, descripcion: true },
      orderBy: { fecha: 'asc' },
    });
  }

  /** Listado completo de un ano, para la pantalla de administracion. */
  async getFestivos(anio: number) {
    return this.prisma.festivo.findMany({
      where: { anio },
      orderBy: { fecha: 'asc' },
    });
  }

  // ============================================================
  // MUTACION
  // ============================================================

  /**
   * Normaliza ambito <-> ccaa <-> municipio. El DTO valida cada campo por
   * separado; esto valida que la combinacion tenga sentido, que es lo que antes
   * permitia crear un LOCAL sin municipio —invisible para siempre— o un
   * NACIONAL con comunidad.
   */
  private normalizarAmbito(dto: { ambito: AmbitoFestivo; ccaa?: string; municipio?: string }) {
    const ccaa      = dto.ccaa?.trim() ?? '';
    const municipio = dto.municipio?.trim() ?? '';

    switch (dto.ambito) {
      case AmbitoFestivo.NACIONAL:
        return { ccaa: '', municipio: '' };

      case AmbitoFestivo.AUTONOMICO:
        if (!ccaa) throw new BadRequestException('Un festivo autonomico necesita comunidad autonoma.');
        return { ccaa, municipio: '' };

      case AmbitoFestivo.LOCAL:
        if (!municipio) throw new BadRequestException('Un festivo local necesita municipio.');
        if (!LOCALES[municipio]) {
          throw new BadRequestException(
            `El municipio "${municipio}" no esta en el catalogo. Anadelo en festivos/data/calendarios.ts.`,
          );
        }
        return { ccaa: LOCALES[municipio].ccaa, municipio };
    }
  }

  async create(dto: CreateFestivoDto) {
    const fecha = diaDesdeIso(dto.fecha);
    const { ccaa, municipio } = this.normalizarAmbito(dto);

    const yaEsta = await this.prisma.festivo.findUnique({
      where: { fecha_ccaa_municipio: { fecha, ccaa, municipio } },
    });
    if (yaEsta) {
      throw new BadRequestException(
        `Ya hay un festivo ese dia con el mismo ambito: "${yaEsta.descripcion}".`,
      );
    }

    return this.prisma.festivo.create({
      data: {
        fecha,
        descripcion: dto.descripcion.trim(),
        ambito: dto.ambito,
        ccaa,
        municipio,
        anio: fecha.getUTCFullYear(),
      },
    });
  }

  /**
   * Corregir un festivo sin borrarlo y recrearlo. Antes no existia: una fecha
   * mal tecleada solo se arreglaba con un borrado, y borrar un festivo es lo
   * que hace que un contrato salga con una sesion de mas.
   */
  async update(id: string, dto: UpdateFestivoDto) {
    const actual = await this.prisma.festivo.findUnique({ where: { id } });
    if (!actual) throw new NotFoundException(`Festivo ${id} no encontrado`);

    const ambito = dto.ambito ?? actual.ambito;
    const { ccaa, municipio } = this.normalizarAmbito({
      ambito,
      ccaa:      dto.ccaa      ?? actual.ccaa,
      municipio: dto.municipio ?? actual.municipio,
    });
    const fecha = dto.fecha ? diaDesdeIso(dto.fecha) : actual.fecha;

    const choque = await this.prisma.festivo.findUnique({
      where: { fecha_ccaa_municipio: { fecha, ccaa, municipio } },
    });
    if (choque && choque.id !== id) {
      throw new BadRequestException(
        `Ya hay un festivo ese dia con el mismo ambito: "${choque.descripcion}".`,
      );
    }

    return this.prisma.festivo.update({
      where: { id },
      data: {
        fecha,
        descripcion: dto.descripcion?.trim() ?? actual.descripcion,
        ambito,
        ccaa,
        municipio,
        anio: fecha.getUTCFullYear(),
      },
    });
  }

  async remove(id: string) {
    const festivo = await this.prisma.festivo.findUnique({ where: { id } });
    if (!festivo) throw new NotFoundException(`Festivo ${id} no encontrado`);
    await this.prisma.festivo.delete({ where: { id } });
  }

  // ============================================================
  // IMPORTACION
  // ============================================================

  /** Los festivos que el catalogo cargaria para un ano, sin escribir nada. */
  async previsualizarCalendario(anio: number) {
    const cfg = await this.getConfiguracion();
    return this.candidatos(anio, cfg);
  }

  /**
   * Carga el calendario del ano: nacionales + autonomicos de la comunidad del
   * centro + locales de su municipio.
   *
   * Ya no hace falta deduplicar en memoria: la tabla tiene indice unico, asi que
   * `skipDuplicates` por fin sirve para algo. Y reporta lo que NO ha podido
   * cargar (`sinDatos`, `sinVerificar`) en vez de dejar un calendario incompleto
   * que parece completo.
   */
  async importarCalendario(anio: number): Promise<ResultadoImportacion> {
    const cfg = await this.getConfiguracion();
    const candidatos = this.candidatos(anio, cfg);

    const { count } = await this.prisma.festivo.createMany({
      data: candidatos,
      skipDuplicates: true,
    });

    return {
      importados: count,
      omitidos: candidatos.length - count,
      sinDatos: this.municipiosSinDatos(cfg),
      sinVerificar: !ANIOS_VERIFICADOS.includes(anio),
    };
  }

  /** Qué falta por cargar en el catálogo, para que la pantalla lo avise. */
  private municipiosSinDatos(cfg: { municipio: string }): string[] {
    if (!cfg.municipio) return ['(sin municipio elegido)'];
    return contarDiasLocales(LOCALES[cfg.municipio]) === 0 ? [cfg.municipio] : [];
  }

  private candidatos(anio: number, cfg: { ccaaCodigo: string; municipio: string }) {
    const pascua = calcularDomingoPascua(anio);
    const dia = (mes: number, d: number) => new Date(Date.UTC(anio, mes - 1, d, 12, 0, 0, 0));

    /**
     * Un dia de fecha fija, trasladado al lunes si cae en domingo.
     *
     * Se aplica a nacionales Y autonomicos. Antes solo a los nacionales, y eso
     * era un fallo con consecuencias: el 2 de mayo de 2027 cae en domingo y la
     * Comunidad de Madrid lo traslada al lunes 3. Sin el traslado, el calendario
     * cerraba el centro un domingo —donde no hay ninguna sesion— y dejaba el
     * lunes abierto, o sea una sesion de mas en el contrato de toda familia de
     * lunes.
     *
     * Los LOCALES no pasan por aqui a proposito: sus dos dias los elige el
     * ayuntamiento cada ano, y a veces escoge fin de semana deliberadamente
     * (Fuenlabrada, 26 de diciembre de 2026, sabado). Trasladarlos seria
     * inventarse un festivo que nadie ha decretado.
     */
    const fijo = (f: DiaFijo) => {
      const { fecha, trasladado } = trasladarSiDomingo(dia(f.mes, f.dia));
      return {
        fecha,
        descripcion: trasladado ? `${f.descripcion} (trasladado del domingo)` : f.descripcion,
      };
    };

    /** Un dia atado a la Pascua: `offsetPascua` dias desde el Domingo de Resurreccion. */
    const movil = (f: DiaMovil) => {
      const d = new Date(pascua);
      d.setDate(d.getDate() + f.offsetPascua);
      return { fecha: normalizarDia(d), descripcion: f.descripcion };
    };

    const nacionales = [
      ...FESTIVOS_FIJOS.map(fijo),
      { fecha: normalizarDia(calcularViernesSanto(anio)), descripcion: 'Viernes Santo' },
    ].map(f => ({ ...f, ambito: AmbitoFestivo.NACIONAL, ccaa: '', municipio: '' }));

    const cal = AUTONOMICOS[cfg.ccaaCodigo];
    const autonomicos = [
      ...(cal?.fijos ?? []).map(fijo),
      ...(cal?.moviles ?? []).map(movil),
    ].map(f => ({ ...f, ambito: AmbitoFestivo.AUTONOMICO, ccaa: cfg.ccaaCodigo, municipio: '' }));

    const local = cfg.municipio ? LOCALES[cfg.municipio] : undefined;
    const locales = [
      ...(local?.fijos ?? []).map(f => ({ fecha: dia(f.mes, f.dia), descripcion: f.descripcion })),
      ...(local?.moviles ?? []).map(movil),
    ].map(f => ({
      ...f,
      ambito: AmbitoFestivo.LOCAL,
      ccaa: local!.ccaa,
      municipio: cfg.municipio,
    }));

    return [...nacionales, ...autonomicos, ...locales].map(f => ({ ...f, anio }));
  }

  /** Si el ano ya tiene cargado el calendario del centro (nacional + autonomico). */
  async tieneCalendario(anio: number): Promise<boolean> {
    const cfg = await this.getConfiguracion();
    const [nacionales, autonomicos] = await Promise.all([
      this.prisma.festivo.count({ where: { anio, ambito: AmbitoFestivo.NACIONAL } }),
      this.prisma.festivo.count({
        where: { anio, ambito: AmbitoFestivo.AUTONOMICO, ccaa: cfg.ccaaCodigo },
      }),
    ]);
    return nacionales > 0 && autonomicos > 0;
  }

  /** Nombre legible del calendario vigente, para pantallas y para el contrato. */
  async etiquetaCalendario(): Promise<string> {
    const cfg = await this.getConfiguracion();
    return cfg.municipio
      ? `${nombreCcaa(cfg.ccaaCodigo)} · ${cfg.municipio}`
      : nombreCcaa(cfg.ccaaCodigo);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesService } from './notificaciones.service';

@Injectable()
export class MotorReglasService {
  private readonly logger = new Logger(MotorReglasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesSvc: NotificacionesService,
  ) {}

  async evaluarReglas(trabajadorId: string, rol: string): Promise<void> {
    try {
      const esAdmin = rol === 'ADMIN';

      // Obtener clientes: todos si ADMIN, solo los asignados si no
      const asignaciones = await this.prisma.clienteTrabajador.findMany({
        where: esAdmin ? { activo: true } : { trabajadorId, activo: true },
        include: {
          cliente: {
            include: {
              sesiones: true,
              informes: true,
              bonos: true,
              objetivosGeneralesAsignados: { include: { evaluaciones: true } },
            },
          },
        },
      });

      const clientes = asignaciones.map((a) => a.cliente);
      const now = new Date();

      await Promise.all([
        ...clientes.map((cliente) =>
          this._evaluarCliente(trabajadorId, cliente, now),
        ),
        // Va aquí y no dentro de `_evaluarCliente` porque no habla de un
        // cliente: es del autónomo. Metida ahí se dispararía una vez por
        // cliente asignado.
        this._reglaFacturasSinEntregar(trabajadorId),
      ]);
    } catch (err) {
      this.logger.error(`Error en evaluarReglas: ${err.message}`, err.stack);
    }
  }

  private async _evaluarCliente(
    trabajadorId: string,
    cliente: any,
    now: Date,
  ) {
    const baseUrl = `/home/listado/${cliente.id}`;

    await Promise.all([
      this._reglaInformeInicialPendiente(trabajadorId, cliente, now, baseUrl),
      this._reglaInformeSeguimientoPendiente(trabajadorId, cliente, now, baseUrl),
      this._reglaBonoAgotado(trabajadorId, cliente, now, baseUrl),
      this._reglaBonoCasiAgotado(trabajadorId, cliente, baseUrl),
      this._reglaBonoPendientePago(trabajadorId, cliente, now, baseUrl),
      this._reglaSinSesionesRecientes(trabajadorId, cliente, now, baseUrl),
      this._reglaObjetivoSinEvaluar(trabajadorId, cliente, now, baseUrl),
      this._reglaInformeEnBorrador(trabajadorId, cliente, now, baseUrl),
      this._reglaSesionSinBono(trabajadorId, cliente, now, baseUrl),
      this._reglaConsentimientoRgpdPendiente(trabajadorId, cliente, baseUrl),
      this._reglaSinRegistrosRecientes(trabajadorId, cliente, now, baseUrl),
    ]);
  }

  // ─── Regla 12: facturas de un periodo cerrado sin entregar a la gestoría ──
  /**
   * A diferencia del resto, esta regla es del trabajador, no de un cliente.
   *
   * Solo avisa si el autónomo tiene una gestoría configurada: si no la tiene, no
   * hay nada que entregar y el aviso sería ruido. Y solo mira periodos cerrados
   * — el mes en curso todavía se está facturando.
   *
   * `referenciaId` es el periodo, así que `crearSiNoExiste` deduplica por
   * periodo: un aviso por trimestre, no uno por evaluación. Al entregar,
   * `FacturasGestoriaService.resolverAvisos` la retira — nada en este motor
   * quita una notificación cuando su condición deja de cumplirse.
   */
  private async _reglaFacturasSinEntregar(trabajadorId: string) {
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id: trabajadorId },
      select: { emailGestoria: true },
    });
    if (!trabajador?.emailGestoria) return;

    const hoy = new Date();
    const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

    const sinEntregar = await this.prisma.factura.findMany({
      where: {
        trabajadorId,
        periodoFacturado: { lt: periodoActual },
        estado: { not: 'ANULADA' },
        entregas: { none: { envio: { estado: 'ENVIADO' } } },
      },
      select: { periodoFacturado: true },
    });
    if (!sinEntregar.length) return;

    const periodos = [...new Set(sinEntregar.map((f) => f.periodoFacturado))].sort();
    const ultimo = periodos[periodos.length - 1];
    const n = sinEntregar.length;

    await this.notificacionesSvc.crearSiNoExiste({
      tipo: 'FACTURAS_SIN_ENTREGAR',
      prioridad: 'MEDIA',
      titulo: `${n} factura${n === 1 ? '' : 's'} sin entregar a la gestoría`,
      mensaje:
        `Tienes ${n} factura${n === 1 ? '' : 's'} de ${periodos.length} ` +
        `periodo${periodos.length === 1 ? '' : 's'} ya cerrado${periodos.length === 1 ? '' : 's'} ` +
        `(${periodos[0]}${periodos.length > 1 ? ` — ${ultimo}` : ''}) que no se han enviado nunca ` +
        'a la gestoría. Prepara el paquete desde Administración › Facturación.',
      accionUrl: '/home/administracion/facturacion',
      reglaOrigen: 'FACTURAS_SIN_ENTREGAR',
      referenciaId: ultimo,
      trabajadorId,
    });
  }

  // ─── Regla 1: Informe inicial pendiente ──────────────────────────────────
  private async _reglaInformeInicialPendiente(
    trabajadorId: string,
    cliente: any,
    now: Date,
    baseUrl: string,
  ) {
    if (!cliente.fechaInicio || !cliente.activo) return;
    const diasDesdeInicio = this._diffDias(cliente.fechaInicio, now);
    if (diasDesdeInicio < 30) return;

    const tieneInformeInicial = cliente.informes.some(
      (i: any) => i.tipoInforme === 'INICIAL' && i.estado === 'FINALIZADO',
    );
    if (tieneInformeInicial) return;

    await this.notificacionesSvc.crearSiNoExiste({
      tipo: 'INFORME_INICIAL_PENDIENTE',
      prioridad: 'URGENTE',
      titulo: `Informe inicial pendiente — ${cliente.nombre} ${cliente.apellidos}`,
      mensaje: `Han pasado ${diasDesdeInicio} días desde el inicio del tratamiento y no existe un informe inicial finalizado.`,
      accionUrl: `${baseUrl}/informes`,
      reglaOrigen: 'INFORME_INICIAL_PENDIENTE',
      clienteId: cliente.id,
      referenciaId: cliente.id,
      trabajadorId,
    });
  }

  // ─── Regla 2: Informe de seguimiento pendiente ────────────────────────────
  private async _reglaInformeSeguimientoPendiente(
    trabajadorId: string,
    cliente: any,
    now: Date,
    baseUrl: string,
  ) {
    if (!cliente.activo) return;

    const informesFinalizados = cliente.informes.filter(
      (i: any) => i.estado === 'FINALIZADO',
    );
    if (informesFinalizados.length === 0) return;

    const ultimoInforme = informesFinalizados.reduce((a: any, b: any) =>
      new Date(a.updatedAt) > new Date(b.updatedAt) ? a : b,
    );
    const dias = this._diffDias(ultimoInforme.updatedAt, now);
    if (dias < 180) return;

    await this.notificacionesSvc.crearSiNoExiste({
      tipo: 'INFORME_SEGUIMIENTO_PENDIENTE',
      prioridad: 'ALTA',
      titulo: `Informe de seguimiento pendiente — ${cliente.nombre} ${cliente.apellidos}`,
      mensaje: `Hace ${dias} días desde el último informe finalizado. Se recomienda redactar un informe de seguimiento.`,
      accionUrl: `${baseUrl}/informes`,
      reglaOrigen: 'INFORME_SEGUIMIENTO_PENDIENTE',
      clienteId: cliente.id,
      referenciaId: cliente.id,
      trabajadorId,
    });
  }

  // ─── Regla 3: Bono agotado sin pagar ─────────────────────────────────────
  private async _reglaBonoAgotado(
    trabajadorId: string,
    cliente: any,
    now: Date,
    baseUrl: string,
  ) {
    const bonosAgotadosNoPagados = cliente.bonos.filter(
      (b: any) => b.estado === 'CONSUMIDO' && !b.pagado,
    );

    for (const bono of bonosAgotadosNoPagados) {
      await this.notificacionesSvc.crearSiNoExiste({
        tipo: 'BONO_AGOTADO',
        prioridad: 'URGENTE',
        titulo: `Bono agotado sin pagar — ${cliente.nombre} ${cliente.apellidos}`,
        mensaje: `El bono de ${bono.totalSesiones} sesiones está consumido y pendiente de pago (${bono.precio}€).`,
        accionUrl: `${baseUrl}/bonos`,
        reglaOrigen: 'BONO_AGOTADO',
        clienteId: cliente.id,
        referenciaId: bono.id,
        trabajadorId,
      });
    }
  }

  // ─── Regla 4: Bono casi agotado ───────────────────────────────────────────
  private async _reglaBonoCasiAgotado(
    trabajadorId: string,
    cliente: any,
    baseUrl: string,
  ) {
    const bonosCasiAgotados = cliente.bonos.filter(
      (b: any) =>
        b.estado === 'ACTIVO' &&
        b.totalSesiones - b.sesionesConsumidas === 1,
    );

    for (const bono of bonosCasiAgotados) {
      await this.notificacionesSvc.crearSiNoExiste({
        tipo: 'BONO_CASI_AGOTADO',
        prioridad: 'ALTA',
        titulo: `Última sesión de bono — ${cliente.nombre} ${cliente.apellidos}`,
        mensaje: `El bono activo de ${bono.totalSesiones} sesiones tiene solo 1 sesión restante. Considera renovarlo.`,
        accionUrl: `${baseUrl}/bonos`,
        reglaOrigen: 'BONO_CASI_AGOTADO',
        clienteId: cliente.id,
        referenciaId: bono.id,
        trabajadorId,
      });
    }
  }

  // ─── Regla 5: Bono pendiente de pago hace 7+ días ────────────────────────
  private async _reglaBonoPendientePago(
    trabajadorId: string,
    cliente: any,
    now: Date,
    baseUrl: string,
  ) {
    const bonosPendientes = cliente.bonos.filter((b: any) => {
      if (b.estado !== 'CONSUMIDO' || b.pagado) return false;
      const dias = this._diffDias(b.updatedAt, now);
      return dias >= 7;
    });

    for (const bono of bonosPendientes) {
      const dias = this._diffDias(bono.updatedAt, now);
      await this.notificacionesSvc.crearSiNoExiste({
        tipo: 'BONO_PENDIENTE_PAGO',
        prioridad: 'URGENTE',
        titulo: `Cobro pendiente hace ${dias} días — ${cliente.nombre} ${cliente.apellidos}`,
        mensaje: `El bono de ${bono.totalSesiones} sesiones (${bono.precio}€) lleva ${dias} días sin abonar.`,
        accionUrl: `${baseUrl}/bonos`,
        reglaOrigen: 'BONO_PENDIENTE_PAGO',
        clienteId: cliente.id,
        referenciaId: bono.id,
        trabajadorId,
      });
    }
  }

  // ─── Regla 6: Sin sesiones recientes (21 días) ────────────────────────────
  private async _reglaSinSesionesRecientes(
    trabajadorId: string,
    cliente: any,
    now: Date,
    baseUrl: string,
  ) {
    if (!cliente.activo) return;

    const hace21Dias = new Date(now);
    hace21Dias.setDate(hace21Dias.getDate() - 21);

    const sesioneReciente = cliente.sesiones.some(
      (s: any) =>
        (s.estado === 'COMPLETADA' || s.estado === 'PROGRAMADA') &&
        new Date(s.fechaHoraInicio) >= hace21Dias,
    );

    if (sesioneReciente) return;

    await this.notificacionesSvc.crearSiNoExiste({
      tipo: 'SIN_SESIONES_RECIENTES',
      prioridad: 'MEDIA',
      titulo: `Sin actividad reciente — ${cliente.nombre} ${cliente.apellidos}`,
      mensaje: `No hay sesiones completadas ni programadas en los últimos 21 días.`,
      accionUrl: `${baseUrl}/sesiones`,
      reglaOrigen: 'SIN_SESIONES_RECIENTES',
      clienteId: cliente.id,
      referenciaId: cliente.id,
      trabajadorId,
    });
  }

  // ─── Regla 7: Objetivo sin evaluar en 30 días ────────────────────────────
  private async _reglaObjetivoSinEvaluar(
    trabajadorId: string,
    cliente: any,
    now: Date,
    baseUrl: string,
  ) {
    for (const co of cliente.objetivosGeneralesAsignados) {
      if (!co.activo) continue;

      const ultimaEval = co.fechaUltimaEvaluacion;
      if (ultimaEval) {
        const dias = this._diffDias(ultimaEval, now);
        if (dias < 30) continue;
      } else {
        const diasDesdeAsignacion = this._diffDias(co.fechaAsignacion, now);
        if (diasDesdeAsignacion < 30) continue;
      }

      await this.notificacionesSvc.crearSiNoExiste({
        tipo: 'OBJETIVO_SIN_EVALUAR',
        prioridad: 'BAJA',
        titulo: `Objetivo sin evaluar — ${cliente.nombre} ${cliente.apellidos}`,
        mensaje: `Un objetivo GAS activo lleva más de 30 días sin evaluación.`,
        accionUrl: `${baseUrl}/objetivos`,
        reglaOrigen: 'OBJETIVO_SIN_EVALUAR',
        clienteId: cliente.id,
        referenciaId: co.id,
        trabajadorId,
      });
    }
  }

  // ─── Regla 8: Informe en borrador hace 14+ días ───────────────────────────
  private async _reglaInformeEnBorrador(
    trabajadorId: string,
    cliente: any,
    now: Date,
    baseUrl: string,
  ) {
    const borradores = cliente.informes.filter((i: any) => {
      if (i.estado !== 'BORRADOR') return false;
      return this._diffDias(i.createdAt, now) >= 14;
    });

    for (const informe of borradores) {
      const dias = this._diffDias(informe.createdAt, now);
      await this.notificacionesSvc.crearSiNoExiste({
        tipo: 'INFORME_EN_BORRADOR',
        prioridad: 'MEDIA',
        titulo: `Informe en borrador desde hace ${dias} días — ${cliente.nombre} ${cliente.apellidos}`,
        mensaje: `El informe "${informe.titulo}" lleva ${dias} días en estado borrador.`,
        accionUrl: `${baseUrl}/informes`,
        reglaOrigen: 'INFORME_EN_BORRADOR',
        clienteId: cliente.id,
        referenciaId: informe.id,
        trabajadorId,
      });
    }
  }

  // ─── Regla 9: Sesión completada sin bono ─────────────────────────────────
  private async _reglaSesionSinBono(
    trabajadorId: string,
    cliente: any,
    now: Date,
    baseUrl: string,
  ) {
    const sesionesSinBono = cliente.sesiones.filter(
      (s: any) => s.estado === 'COMPLETADA' && !s.bonoId,
    );

    for (const sesion of sesionesSinBono) {
      await this.notificacionesSvc.crearSiNoExiste({
        tipo: 'SESION_SIN_BONO',
        prioridad: 'ALTA',
        titulo: `Sesión sin bono asignado — ${cliente.nombre} ${cliente.apellidos}`,
        mensaje: `Una sesión completada no tiene bono asignado. Revisa y asocia el bono correspondiente.`,
        accionUrl: `${baseUrl}/sesiones`,
        reglaOrigen: 'SESION_SIN_BONO',
        clienteId: cliente.id,
        referenciaId: sesion.id,
        trabajadorId,
      });
    }
  }

  // ─── Regla 10: Consentimiento RGPD pendiente ─────────────────────────────
  private async _reglaConsentimientoRgpdPendiente(
    trabajadorId: string,
    cliente: any,
    baseUrl: string,
  ) {
    if (!cliente.activo || cliente.consentimientoRgpd) return;

    await this.notificacionesSvc.crearSiNoExiste({
      tipo: 'CONSENTIMIENTO_RGPD_PENDIENTE',
      prioridad: 'ALTA',
      titulo: `Consentimiento RGPD pendiente — ${cliente.nombre} ${cliente.apellidos}`,
      mensaje: `El cliente no ha otorgado el consentimiento de tratamiento de datos (Art. 9 LOPDGDD). Obtén la autorización antes de continuar el tratamiento.`,
      accionUrl: `${baseUrl}/perfil`,
      reglaOrigen: 'CONSENTIMIENTO_RGPD_PENDIENTE',
      clienteId: cliente.id,
      referenciaId: cliente.id,
      trabajadorId,
    });
  }

  // ─── Regla 11: Sin registros diarios en 14+ días ─────────────────────────
  private async _reglaSinRegistrosRecientes(
    trabajadorId: string,
    cliente: any,
    now: Date,
    baseUrl: string,
  ) {
    if (!cliente.activo) return;

    const ultimoRegistro = await this.prisma.registroDiario.findFirst({
      where: { clienteId: cliente.id, trabajadorId },
      orderBy: { fechaRegistro: 'desc' },
      select: { fechaRegistro: true },
    });

    let dias: number | null = null;
    if (ultimoRegistro) {
      dias = this._diffDias(ultimoRegistro.fechaRegistro, now);
      if (dias < 14) return;
    } else {
      // Nuevo cliente sin ningún registro — solo alertar si lleva 14+ días activo
      if (!cliente.fechaInicio) return;
      if (this._diffDias(cliente.fechaInicio, now) < 14) return;
    }

    await this.notificacionesSvc.crearSiNoExiste({
      tipo: 'SIN_REGISTROS_RECIENTES',
      prioridad: 'BAJA',
      titulo: `Sin registros recientes — ${cliente.nombre} ${cliente.apellidos}`,
      mensaje: dias !== null
        ? `Llevas ${dias} días sin añadir un registro de sesión para este cliente.`
        : `No hay ningún registro de sesión para este cliente.`,
      accionUrl: `${baseUrl}/progreso`,
      reglaOrigen: 'SIN_REGISTROS_RECIENTES',
      clienteId: cliente.id,
      referenciaId: cliente.id,
      trabajadorId,
    });
  }

  // ─── Utilidad ─────────────────────────────────────────────────────────────
  private _diffDias(desde: Date | string, hasta: Date): number {
    const d1 = new Date(desde).getTime();
    const d2 = hasta.getTime();
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
  }
}

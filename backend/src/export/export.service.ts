import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import { ExportFormato, ExportQueryDto } from './dto/export-query.dto';
import * as ExcelJS from 'exceljs';

export interface ExportResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

// ─── Helpers ────────────────────────────────────────────────

function fmtFecha(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES');
}

function fmtHora(d: Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ─── HTML genérico para tablas ───────────────────────────────

function buildTableHtml(opts: {
  titulo: string;
  subtitulo: string;
  headers: string[];
  rows: string[][];
}): string {
  const headerCells = opts.headers
    .map((h) => `<th style="background:#7c6fd6;color:#fff;padding:8px 10px;font-size:11px;text-align:left;border:1px solid #5a4fa8;">${escapeHtml(h)}</th>`)
    .join('');

  const bodyRows = opts.rows
    .map(
      (row, i) =>
        `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f5f3fc'};">
          ${row.map((cell) => `<td style="padding:6px 10px;font-size:10px;border:1px solid #e8e4f8;color:#374151;">${escapeHtml(cell)}</td>`).join('')}
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #1f2937; }
    @page { size: A4 landscape; margin: 1.5cm; }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:16px;">
    <h1 style="font-size:16px;font-weight:700;color:#7c6fd6;">${escapeHtml(opts.titulo)}</h1>
    <p style="font-size:11px;color:#6b7280;margin-top:4px;">${escapeHtml(opts.subtitulo)}</p>
    <hr style="border:none;border-top:2px solid #7c6fd6;margin-top:10px;">
  </div>
  <table style="width:100%;border-collapse:collapse;">
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  <p style="text-align:center;font-size:9px;color:#9ca3af;margin-top:12px;">
    Documento confidencial — Gabinete Psicopedagógico · Generado el ${fmtFecha(new Date())}
  </p>
</body>
</html>`;
}

// ─── Excel helper ────────────────────────────────────────────

async function buildExcel(opts: {
  sheetName: string;
  headers: string[];
  rows: (string | number)[][];
}): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(opts.sheetName);

  ws.columns = opts.headers.map((h) => ({
    header: h,
    key: h,
    width: Math.max(h.length + 4, 16),
  }));

  // Header row style
  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C6FD6' } };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF5A4FA8' } },
      bottom: { style: 'thin', color: { argb: 'FF5A4FA8' } },
      left: { style: 'thin', color: { argb: 'FF5A4FA8' } },
      right: { style: 'thin', color: { argb: 'FF5A4FA8' } },
    };
  });
  headerRow.height = 22;

  opts.rows.forEach((row, i) => {
    const r = ws.addRow(row);
    const bg = i % 2 === 0 ? 'FFFFFFFF' : 'FFF5F3FC';
    r.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.border = {
        top: { style: 'hair', color: { argb: 'FFE8E4F8' } },
        bottom: { style: 'hair', color: { argb: 'FFE8E4F8' } },
        left: { style: 'hair', color: { argb: 'FFE8E4F8' } },
        right: { style: 'hair', color: { argb: 'FFE8E4F8' } },
      };
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

// ─── Service ─────────────────────────────────────────────────

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGenerator: PdfGeneratorService,
  ) {}

  // ── Sesiones de un cliente ────────────────────────────────

  async exportSesiones(clienteId: string, query: ExportQueryDto): Promise<ExportResult> {
    const where: any = { clienteId };
    if (query.desde || query.hasta) {
      where.fechaHoraInicio = {};
      if (query.desde) where.fechaHoraInicio.gte = new Date(query.desde);
      if (query.hasta) where.fechaHoraInicio.lte = new Date(query.hasta + 'T23:59:59');
    }

    const sesiones = await this.prisma.sesion.findMany({
      where,
      orderBy: { fechaHoraInicio: 'asc' },
      include: { bono: { select: { id: true, sesionesConsumidas: true, totalSesiones: true } } },
    });

    const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
    const nombreCliente = cliente ? `${cliente.apellidos}, ${cliente.nombre}` : clienteId;

    const headers = ['Fecha', 'Hora inicio', 'Hora fin', 'Estado', 'Tipo', 'Bono'];
    const rows = sesiones.map((s) => [
      fmtFecha(s.fechaHoraInicio),
      fmtHora(s.fechaHoraInicio),
      fmtHora(s.fechaHoraFin),
      s.estado,
      s.tipoSesion,
      s.bono ? `${s.bono.sesionesConsumidas}/${s.bono.totalSesiones}` : '—',
    ]);

    const fmt = query.formato ?? ExportFormato.PDF;
    this.logger.log(`Exportando ${sesiones.length} sesiones de ${nombreCliente} (${fmt})`);

    if (fmt === ExportFormato.EXCEL) {
      const buffer = await buildExcel({ sheetName: 'Sesiones', headers, rows });
      return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `sesiones_${clienteId}.xlsx` };
    }

    const periodo = query.desde || query.hasta
      ? `Período: ${query.desde ?? '—'} / ${query.hasta ?? '—'}`
      : 'Todas las sesiones';

    const html = buildTableHtml({
      titulo: `Historial de Sesiones — ${nombreCliente}`,
      subtitulo: periodo,
      headers,
      rows,
    });
    const buffer = await this.pdfGenerator.generatePdf(html);
    return { buffer, contentType: 'application/pdf', filename: `sesiones_${clienteId}.pdf` };
  }

  // ── Bonos de un cliente (o todos) ────────────────────────

  async exportBonos(clienteId: string | null, query: ExportQueryDto): Promise<ExportResult> {
    const where: any = {};
    if (clienteId) where.clienteId = clienteId;
    if (query.desde || query.hasta) {
      where.fechaInicio = {};
      if (query.desde) where.fechaInicio.gte = new Date(query.desde);
      if (query.hasta) where.fechaInicio.lte = new Date(query.hasta + 'T23:59:59');
    }

    const bonos = await this.prisma.bono.findMany({
      where,
      orderBy: { fechaInicio: 'asc' },
      include: { cliente: { select: { nombre: true, apellidos: true } } },
    });

    const headers = ['Cliente', 'Fecha inicio', 'Fecha fin', 'Sesiones', 'Precio (€)', 'Estado', 'Pagado'];
    const rows = bonos.map((b) => [
      `${b.cliente.apellidos}, ${b.cliente.nombre}`,
      fmtFecha(b.fechaInicio),
      fmtFecha(b.fechaFin),
      `${b.sesionesConsumidas}/${b.totalSesiones}`,
      Number(b.precio).toFixed(2),
      b.estado,
      b.pagado ? 'Sí' : 'No',
    ]);

    const fmt = query.formato ?? ExportFormato.PDF;
    const titulo = clienteId ? `Historial de Bonos — cliente` : 'Historial de Bonos — Todos los clientes';
    this.logger.log(`Exportando ${bonos.length} bonos (${fmt})`);

    if (fmt === ExportFormato.EXCEL) {
      const buffer = await buildExcel({ sheetName: 'Bonos', headers, rows });
      return { buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename: `bonos${clienteId ? '_' + clienteId : ''}.xlsx` };
    }

    const periodo = query.desde || query.hasta
      ? `Período: ${query.desde ?? '—'} / ${query.hasta ?? '—'}`
      : 'Todos los registros';

    const html = buildTableHtml({ titulo, subtitulo: periodo, headers, rows });
    const buffer = await this.pdfGenerator.generatePdf(html);
    return { buffer, contentType: 'application/pdf', filename: `bonos${clienteId ? '_' + clienteId : ''}.pdf` };
  }
}

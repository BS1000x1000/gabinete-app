import { Component, OnInit, OnDestroy, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { TrabajadorService } from '../../../../../services/trabajadores.service';
import {
  PeriodicidadEnvio,
  PERIODICIDAD_LABEL,
} from '../../../../../interface/factura.interface';
import { AuthService } from '../../../../../services/auth.service';

type FiscalForm = {
  nifFiscal: string;
  nombreFiscal: string;
  direccionFiscal: string;
  codigoPostalFiscal: string;
  ciudadFiscal: string;
  provinciaFiscal: string;
  iban: string;
  swift: string;
  retencionIrpf: number;
  emailFacturacion: string;
  nombreGestoria: string;
  emailGestoria: string;
  periodicidadGestoria: PeriodicidadEnvio;
};

/**
 * El mensaje legible de un error del backend.
 *
 * `ValidationPipe` de Nest devuelve `message` como **array** de strings, uno por
 * regla incumplida. Interpolarlo tal cual pintaba los mensajes pegados por comas,
 * asi que un fallo de formato en el IBAN se leia como ruido en vez de como una
 * instruccion.
 */
function mensajeDeError(err: any): string {
  const msg = err?.error?.message;
  if (Array.isArray(msg) && msg.length) return msg.join('. ') + '.';
  if (typeof msg === 'string' && msg) return msg;
  return 'Error al guardar los datos fiscales.';
}

@Component({
  selector: 'app-trabajador-facturacion-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trabajador-facturacion-tab.component.html',
})
export class TrabajadorFacturacionTabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly trabajadorSvc = inject(TrabajadorService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * De quien son los datos fiscales. Se resuelve por este orden:
   *   1. `:id` de la ficha de trabajador (`/home/trabajadores/:id/facturacion`)
   *   2. el usuario en sesion (`/home/administracion/datos-fiscales`)
   *
   * Con eso el mismo componente sirve las dos rutas. Antes el NIF, el IBAN y el
   * IRPF solo se podian tocar desde la ficha, dentro de "Equipo", asi que un
   * autonomo entraba en Administracion a facturar y no encontraba justo los
   * datos que determinan su factura.
   */
  private readonly trabajadorId: string =
    this.route.parent?.snapshot.paramMap.get('id')
    ?? this.route.snapshot.paramMap.get('id')
    ?? this.auth.currentTrabajadorId()
    ?? '';

  readonly form = signal<FiscalForm>({
    nifFiscal: '', nombreFiscal: '', direccionFiscal: '',
    codigoPostalFiscal: '', ciudadFiscal: '', provinciaFiscal: '',
    iban: '', swift: '', retencionIrpf: 0, emailFacturacion: '',
    nombreGestoria: '', emailGestoria: '', periodicidadGestoria: 'NINGUNA',
  });

  /**
   * Lo que le falta a la ficha para poder EMITIR una factura, no para guardarla.
   *
   * Son los mismos campos que exige `motivoSinDatosEmisor()` en el backend
   * (`facturas.utils.ts`): el RD 1619/2012 art. 6 pide NIF y domicilio del
   * expedidor igual que los del destinatario. Se avisa aqui porque si no el
   * bloqueo aparece mucho mas tarde, al generar el mes, y desde una pantalla
   * distinta de la que hay que arreglar.
   *
   * No se marcan como `required` en los inputs a proposito: la ficha se rellena a
   * trozos y guardarla a medias es legitimo. Lo que no es legitimo es facturar
   * a medias.
   */
  readonly faltaParaFacturar = computed(() => {
    const f = this.form();
    const vacio = (v: string) => !v || !v.trim();
    return [
      vacio(f.nifFiscal) && 'NIF fiscal',
      vacio(f.direccionFiscal) && 'dirección fiscal',
      vacio(f.codigoPostalFiscal) && 'código postal',
      vacio(f.ciudadFiscal) && 'ciudad',
    ].filter((x): x is string => typeof x === 'string');
  });

  readonly guardando = signal(false);
  readonly exito     = signal(false);
  readonly error     = signal<string | null>(null);
  private exitoTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const cached = this.trabajadorSvc.currentTrabajador();
    if (cached && cached.id === this.trabajadorId) {
      this.fromTrabajador(cached);
    } else {
      this.trabajadorSvc.getTrabajador(this.trabajadorId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: res => this.fromTrabajador(res.data) });
    }
  }

  ngOnDestroy(): void {
    if (this.exitoTimer !== null) clearTimeout(this.exitoTimer);
  }

  private fromTrabajador(t: any): void {
    this.form.set({
      nifFiscal:          t?.nifFiscal          ?? '',
      nombreFiscal:       t?.nombreFiscal       ?? '',
      direccionFiscal:    t?.direccionFiscal    ?? '',
      codigoPostalFiscal: t?.codigoPostalFiscal ?? '',
      ciudadFiscal:       t?.ciudadFiscal       ?? '',
      provinciaFiscal:    t?.provinciaFiscal    ?? '',
      iban:               t?.iban               ?? '',
      swift:              t?.swift              ?? '',
      retencionIrpf:      t?.retencionIrpf      ?? 0,
      emailFacturacion:   t?.emailFacturacion   ?? '',
      nombreGestoria:     t?.nombreGestoria     ?? '',
      emailGestoria:      t?.emailGestoria      ?? '',
      periodicidadGestoria: t?.periodicidadGestoria ?? 'NINGUNA',
    });
  }

  /** Opciones del selector de periodicidad, en el orden en que se leen. */
  readonly periodicidades: { valor: PeriodicidadEnvio; label: string }[] = [
    { valor: 'NINGUNA',    label: PERIODICIDAD_LABEL.NINGUNA },
    { valor: 'MENSUAL',    label: PERIODICIDAD_LABEL.MENSUAL },
    { valor: 'TRIMESTRAL', label: PERIODICIDAD_LABEL.TRIMESTRAL },
  ];

  patch<K extends keyof FiscalForm>(k: K, v: any): void {
    this.form.update(f => ({ ...f, [k]: v }));
  }

  guardar(): void {
    this.guardando.set(true);
    this.error.set(null);
    this.trabajadorSvc.updateDatosFiscalesDe(this.trabajadorId, this.form())
      .pipe(finalize(() => this.guardando.set(false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.exito.set(true);
          if (this.exitoTimer !== null) clearTimeout(this.exitoTimer);
          this.exitoTimer = setTimeout(() => this.exito.set(false), 3500);
        },
        error: (err: any) => this.error.set(mensajeDeError(err)),
      });
  }
}

export default TrabajadorFacturacionTabComponent;

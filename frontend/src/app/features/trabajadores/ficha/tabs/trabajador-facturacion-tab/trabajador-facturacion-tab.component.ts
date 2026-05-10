import { Component, OnInit, OnDestroy, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { TrabajadorService } from '../../../../../services/trabajadores.service';

type FiscalForm = {
  nifFiscal: string;
  nombreFiscal: string;
  direccionFiscal: string;
  codigoPostalFiscal: string;
  ciudadFiscal: string;
  provinciaFiscal: string;
  iban: string;
  retencionIrpf: number;
  emailFacturacion: string;
};

@Component({
  selector: 'app-trabajador-facturacion-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trabajador-facturacion-tab.component.html',
})
export class TrabajadorFacturacionTabComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly trabajadorSvc = inject(TrabajadorService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly trabajadorId: string = this.route.parent?.snapshot.paramMap.get('id') ?? '';

  readonly form = signal<FiscalForm>({
    nifFiscal: '', nombreFiscal: '', direccionFiscal: '',
    codigoPostalFiscal: '', ciudadFiscal: '', provinciaFiscal: '',
    iban: '', retencionIrpf: 0, emailFacturacion: '',
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
      retencionIrpf:      t?.retencionIrpf      ?? 0,
      emailFacturacion:   t?.emailFacturacion   ?? '',
    });
  }

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
        error: (err: any) => this.error.set(err?.error?.message ?? 'Error al guardar los datos fiscales.'),
      });
  }
}

export default TrabajadorFacturacionTabComponent;

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { DataFieldComponent } from '../../../../../shared/components/data-field/data-field.component';

type Seccion = 'personal' | 'contacto' | 'gabinete' | 'autorizaciones' | null;

@Component({
  selector: 'app-cliente-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataFieldComponent],
  templateUrl: './cliente-tab.component.html',
})
export class ClienteTabComponent implements OnInit {
  private clienteSvc = inject(ClientesService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  cliente = this.clienteSvc.cliente;
  clienteId = '';

  // Qué sección está en modo edición
  seccionEditando = signal<Seccion>(null);
  guardando = signal(false);
  errorGuardado = signal<string | null>(null);

  // ─── FORMULARIOS POR SECCIÓN ──────────────────────────────
  formPersonal = this.fb.group({
    nombre:          ['', Validators.required],
    apellidos:       ['', Validators.required],
    fechaNacimiento: [''],
    dni:             ['', Validators.required],
    curso:           [''],
  });

  formContacto = this.fb.group({
    domicilio: [''],
    provincia: [''],
    ciudad:    [''],
  });

  formGabinete = this.fb.group({
    fechaInicio: [''],
    fechaAlta:   [''],
  });

  formAutorizaciones = this.fb.group({
    autorizaDatosPersonales: [false],
    autorizaDatosImagen:     [false],
  });

  ngOnInit() {
    this.clienteId = this.route.parent?.snapshot.paramMap.get('id') || '';
  }

  // ─── HELPERS ──────────────────────────────────────────────
  private toInputDate(d: Date | string | null | undefined): string {
    if (!d) return '';
    const fecha = d instanceof Date ? d : new Date(d);
    if (isNaN(fecha.getTime())) return '';
    return fecha.toISOString().split('T')[0];
  }

  // ─── ABRIR EDICIÓN ────────────────────────────────────────
  editar(seccion: Seccion) {
    const c = this.cliente();
    this.errorGuardado.set(null);
    this.seccionEditando.set(seccion);

    if (seccion === 'personal') {
      this.formPersonal.patchValue({
        nombre:          c?.nombre ?? '',
        apellidos:       c?.apellidos ?? '',
        fechaNacimiento: this.toInputDate(c?.fechaNacimiento),
        dni:             c?.dni ?? '',
        curso:           (c as any)?.curso ?? '',
      });
    } else if (seccion === 'contacto') {
      this.formContacto.patchValue({
        domicilio: c?.domicilio ?? '',
        provincia: c?.provincia ?? '',
        ciudad:    c?.ciudad ?? '',
      });
    } else if (seccion === 'gabinete') {
      this.formGabinete.patchValue({
        fechaInicio: this.toInputDate(c?.fechaInicio),
        fechaAlta:   this.toInputDate(c?.fechaAlta),
      });
    } else if (seccion === 'autorizaciones') {
      this.formAutorizaciones.patchValue({
        autorizaDatosPersonales: c?.autorizaDatosPersonales ?? false,
        autorizaDatosImagen:     c?.autorizaDatosImagen ?? false,
      });
    }
  }

  cancelar() {
    this.seccionEditando.set(null);
    this.errorGuardado.set(null);
  }

  // ─── GUARDAR ──────────────────────────────────────────────
  guardar() {
    const seccion = this.seccionEditando();
    if (!seccion || !this.clienteId) return;

    const formMap: Record<string, any> = {
      personal:       this.formPersonal,
      contacto:       this.formContacto,
      gabinete:       this.formGabinete,
      autorizaciones: this.formAutorizaciones,
    };

    const form = formMap[seccion];
    if (form.invalid) { form.markAllAsTouched(); return; }

    this.guardando.set(true);
    this.errorGuardado.set(null);

    const payload = { ...form.value };

    this.clienteSvc.updateCliente(this.clienteId, payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.seccionEditando.set(null);
        // Recargar datos en los signals del servicio
        this.clienteSvc.loadAll(this.clienteId).subscribe();
      },
      error: (err) => {
        this.guardando.set(false);
        this.errorGuardado.set(err?.error?.message || 'Error al guardar los cambios.');
      },
    });
  }
}

export default ClienteTabComponent;
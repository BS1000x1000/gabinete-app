import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { DataFieldComponent } from '../../../../../shared/components/data-field/data-field.component';

type SeccionSanitario = 'diagnostico' | 'medicacion' | 'adaptaciones' | null;

@Component({
  selector: 'app-sanitario-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataFieldComponent],
  templateUrl: './sanitario-tab.component.html',
})
export class SanitarioTabComponent implements OnInit {
  private clienteSvc = inject(ClientesService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  sanitario = this.clienteSvc.sanitario;
  clienteId = '';

  seccionEditando = signal<SeccionSanitario>(null);
  guardando = signal(false);
  error = signal<string | null>(null);

  formDiagnostico = this.fb.group({
    diagnostico:  ['', Validators.required],
    centroSalud:  [''],
    alergias:     [''],
  });

  formMedicacion = this.fb.group({
    medicacion:   [''],
    tratamientos: [''],
    especialistas:[''],   // string separado por comas, se convierte a array
  });

  formAdaptaciones = this.fb.group({
    adaptaciones:     [false],
    tipoAdaptaciones: [''],
    apoyos:           [false],
  });

  ngOnInit() {
    this.clienteId = this.route.parent?.snapshot.paramMap.get('id') || '';
  }

  editar(seccion: SeccionSanitario) {
    const s = this.sanitario();
    this.error.set(null);
    this.seccionEditando.set(seccion);

    if (seccion === 'diagnostico') {
      this.formDiagnostico.patchValue({
        diagnostico: s?.diagnostico ?? '',
        centroSalud: s?.centroSalud ?? '',
        alergias:    s?.alergias ?? '',
      });
    } else if (seccion === 'medicacion') {
      this.formMedicacion.patchValue({
        medicacion:    s?.medicacion ?? '',
        tratamientos:  s?.tratamientos ?? '',
        especialistas: (s?.especialistas ?? []).join(', '),
      });
    } else if (seccion === 'adaptaciones') {
      this.formAdaptaciones.patchValue({
        adaptaciones:     s?.adaptaciones ?? false,
        tipoAdaptaciones: s?.tipoAdaptaciones ?? '',
        apoyos:           s?.apoyos ?? false,
      });
    }
  }

  cancelar() {
    this.seccionEditando.set(null);
    this.error.set(null);
  }

  guardar() {
    const seccion = this.seccionEditando();
    if (!seccion || !this.clienteId) return;

    const formMap: Record<string, any> = {
      diagnostico:  this.formDiagnostico,
      medicacion:   this.formMedicacion,
      adaptaciones: this.formAdaptaciones,
    };

    const form = formMap[seccion];
    if (form.invalid) { form.markAllAsTouched(); return; }

    this.guardando.set(true);
    this.error.set(null);

    let payload: any = { ...form.value };

    // Convertir especialistas de string a array
    if (seccion === 'medicacion' && typeof payload.especialistas === 'string') {
      payload.especialistas = payload.especialistas
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    this.clienteSvc.updateSanitario(this.clienteId, payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.seccionEditando.set(null);
        this.clienteSvc.loadAll(this.clienteId).subscribe();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set(err?.error?.message || 'Error al guardar.');
      },
    });
  }

  // Indica si la sección de adaptaciones tiene datos visibles
  tieneAdaptaciones = () => this.sanitario()?.adaptaciones || this.sanitario()?.apoyos;
}

export default SanitarioTabComponent;
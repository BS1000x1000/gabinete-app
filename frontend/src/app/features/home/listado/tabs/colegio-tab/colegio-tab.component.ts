import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { DataFieldComponent } from '../../../../../shared/components/data-field/data-field.component';

type SeccionColegio = 'centro' | 'contacto1' | 'contacto2' | null;

@Component({
  selector: 'app-colegio-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataFieldComponent],
  templateUrl: './colegio-tab.component.html',
})
export class ColegioTabComponent implements OnInit {
  private clienteSvc = inject(ClientesService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  colegio   = this.clienteSvc.colegio;
  sanitario = this.clienteSvc.sanitario;
  clienteId = '';

  seccionEditando = signal<SeccionColegio>(null);
  guardando = signal(false);
  error     = signal<string | null>(null);

  formCentro = this.fb.group({
    nombre:          ['', Validators.required],
    direccionColegio:[''],
    cursoEscolar:    [''],
  });

  formContacto1 = this.fb.group({
    ctoColegioUno:         ['', Validators.required],
    ctoTelefonoUno:        ['', Validators.required],
    ctoEmailColegioUno:    ['', Validators.email],
    ctoRelacionColegioUno: [''],
  });

  formContacto2 = this.fb.group({
    ctoColegioDos:         [''],
    ctoTelefonoDos:        [''],
    ctoEmailColegioDos:    ['', Validators.email],
    ctoRelacionColegioDos: [''],
  });

  ngOnInit() {
    this.clienteId = this.route.parent?.snapshot.paramMap.get('id') || '';
  }

  editar(seccion: SeccionColegio) {
    const c = this.colegio();
    this.error.set(null);
    this.seccionEditando.set(seccion);

    if (seccion === 'centro') {
      this.formCentro.patchValue({
        nombre:           c?.nombreDelCentro ?? '',
        direccionColegio: c?.direccionColegio ?? '',
        cursoEscolar:     c?.cursoEscolar ?? '',
      });
    } else if (seccion === 'contacto1') {
      this.formContacto1.patchValue({
        ctoColegioUno:         c?.ctoColegioUno ?? '',
        ctoTelefonoUno:        c?.ctoTelefonoUno ?? '',
        ctoEmailColegioUno:    c?.ctoEmailColegioUno ?? '',
        ctoRelacionColegioUno: c?.ctoRelacionColegioUno ?? '',
      });
    } else if (seccion === 'contacto2') {
      this.formContacto2.patchValue({
        ctoColegioDos:         c?.ctoColegioDos ?? '',
        ctoTelefonoDos:        c?.ctoTelefonoDos ?? '',
        ctoEmailColegioDos:    c?.ctoEmailColegioDos ?? '',
        ctoRelacionColegioDos: c?.ctoRelacionColegioDos ?? '',
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
      centro:    this.formCentro,
      contacto1: this.formContacto1,
      contacto2: this.formContacto2,
    };

    const form = formMap[seccion];
    if (form.invalid) { form.markAllAsTouched(); return; }

    this.guardando.set(true);
    this.error.set(null);

    this.clienteSvc.updateColegio(this.clienteId, form.value).subscribe({
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
}

export default ColegioTabComponent;
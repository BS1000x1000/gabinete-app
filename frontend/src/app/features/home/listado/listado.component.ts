/* listado.component.ts */
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.scss']
})
export class ListadoComponent {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  alumnoId = signal<number>(1);
  alumno = signal<any>(null);          // luego lo llenas del servicio

  readonly tabs = ['cliente', 'contactos', 'colegio', 'sanitario', 'demanda', 'tratamientos'] as const;
  pestania = signal<typeof this.tabs[number]>('cliente');

  form = this.fb.nonNullable.group({
    // campos según imagen
    nombre:             ['', Validators.required],
    apellidos:          ['', Validators.required],
    dni:                ['', Validators.required],
    fechaNac:           ['', Validators.required],
    provincia:          [''],
    ciudad:             [''],
    domicilio:          [''],
    movil:              [''],
    telefono:           [''],
    email:              [''],
    tutorLegal:         [''],
    fechaAlta:          [''],
    fechaInicio:        [''],
    firmado:            [false],
    recibirInfo:        [false],
    autorizaImagen:     [false],
    medicacion:         [''],
    autorizaInclusion:  [false]
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.alumnoId.set(id);
    // aquí llamas a tu servicio y haces this.form.patchValue(datos)
  }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    // llamada al servicio
  }
}
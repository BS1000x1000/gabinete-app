import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { DataFieldComponent } from '../../../../../shared/components/data-field/data-field.component';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-contactos-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataFieldComponent, ConfirmModalComponent],
  templateUrl: './contactos-tab.component.html',
})
export class ContactosTabComponent implements OnInit {
  private clienteSvc = inject(ClientesService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  contactosFamiliares = this.clienteSvc.contactosFamiliares;
  clienteId = '';

  editandoId = signal<string | null>(null);   // ID del contacto en edición
  agregando  = signal(false);                  // Modo nuevo contacto
  guardando  = signal(false);
  error      = signal<string | null>(null);

  pendingAction  = signal<(() => void) | null>(null);
  confirmMsg     = signal('');

  readonly PARENTESCOS = ['Madre', 'Padre', 'Tutor/a Legal', 'Abuelo/a', 'Tío/a', 'Hermano/a', 'Otro'];

  private crearFormContacto(c?: any) {
    return this.fb.group({
      nombre:             [c?.nombre ?? '',      Validators.required],
      apellidos:          [c?.apellidos ?? '',   Validators.required],
      parentesco:         [c?.parentesco ?? '',  Validators.required],
      dni:                [c?.dni ?? ''],
      telefono:           [c?.telefono ?? '',    Validators.required],
      email:              [c?.email ?? '',       Validators.email],
      esContactoPrincipal:[c?.esContactoPrincipal ?? false],
      esResponsablePago:  [c?.esResponsablePago ?? false],
      whatsapp:           [c?.whatsapp ?? true],
    });
  }

  // Formulario de edición de un contacto existente
  formEditar = this.crearFormContacto();
  // Formulario para nuevo contacto
  formNuevo  = this.crearFormContacto();

  ngOnInit() {
    this.clienteId = this.route.parent?.snapshot.paramMap.get('id') || '';
  }

  abrirEditar(contacto: any) {
    this.agregando.set(false);
    this.error.set(null);
    this.formEditar = this.crearFormContacto(contacto);
    this.editandoId.set(contacto.id);
  }

  cancelarEditar() {
    this.editandoId.set(null);
    this.error.set(null);
  }

  abrirNuevo() {
    this.editandoId.set(null);
    this.error.set(null);
    this.formNuevo = this.crearFormContacto();
    this.agregando.set(true);
  }

  cancelarNuevo() {
    this.agregando.set(false);
    this.error.set(null);
  }

  guardarEdicion(contactoId: string) {
    if (this.formEditar.invalid) { this.formEditar.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.error.set(null);

    this.clienteSvc.updateFamiliar(this.clienteId, contactoId, this.formEditar.value)
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.editandoId.set(null);
          this.clienteSvc.loadAll(this.clienteId).subscribe();
        },
        error: (err) => {
          this.guardando.set(false);
          this.error.set(err?.error?.message || 'Error al guardar.');
        },
      });
  }

  guardarNuevo() {
    if (this.formNuevo.invalid) { this.formNuevo.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.error.set(null);

    this.clienteSvc.crearFamiliar(this.clienteId, this.formNuevo.value)
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.agregando.set(false);
          this.clienteSvc.loadAll(this.clienteId).subscribe();
        },
        error: (err) => {
          this.guardando.set(false);
          this.error.set(err?.error?.message || 'Error al crear contacto.');
        },
      });
  }

  eliminar(contactoId: string, nombre: string) {
    this.confirmMsg.set(`¿Eliminar el contacto "${nombre}"?`);
    this.pendingAction.set(() => {
      this.clienteSvc.eliminarFamiliar(this.clienteId, contactoId)
        .subscribe({
          next: () => this.clienteSvc.loadAll(this.clienteId).subscribe(),
          error: (err) => this.error.set(err?.error?.message || 'Error al eliminar.'),
        });
    });
  }

  onConfirmado() { this.pendingAction()?.(); this.pendingAction.set(null); }
  onCancelado()  { this.pendingAction.set(null); }
}

export default ContactosTabComponent;
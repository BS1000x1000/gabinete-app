import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputFieldComponent implements OnChanges {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() controlName: string = '';
  @Input() parentForm!: FormGroup;
  @Input() hidden: boolean = false;

  control!: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentForm'] || changes['controlName']) {
      this.control = this.parentForm?.get(this.controlName);
    }
  }

  get errorMessage(): string {
    if (!this.control || !this.control.errors) {
      return '';
    }

    if (this.control.errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (this.control.errors['email']) {
      return 'Por favor, introduce un email válido.';
    }
    // Puedes añadir más validadores aquí
    return 'Error de validación.';
  }
}
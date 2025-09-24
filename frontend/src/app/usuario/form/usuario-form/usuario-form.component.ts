import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Asume que este servicio maneja las peticiones HTTP para los profesores
// Componentes compartidos
import { InputFieldComponent } from '../../../shared/components/input/input.component';
import { UsuarioService } from '../../../shared/services/usuario.service';
// import { FileUploadComponent } from '../../shared/file-upload/file-upload.component';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputFieldComponent],
  templateUrl: './usuario-form.component.html',
  styleUrl: './usuario-form.component.scss',
})
export class UsuarioFormComponent implements OnInit, OnChanges {
  @Input() type: 'create' | 'update' = 'create';
  @Input() data: any;
  @Input() relatedData: any;
  @Output() setOpen = new EventEmitter<boolean>();

  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private userService = inject(UsuarioService);
  private router = inject(Router);

  // Formulario reactivo
  userForm!: FormGroup;

  // Estado del componente con Signals
  imgUrl = signal<string | undefined>(undefined);
  state = signal<{ success: boolean; error: boolean }>({
    success: false,
    error: false,
  });

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.initForm();
      if (this.data.birthday) {
        // Formatear la fecha para el input de tipo 'date'
        const formattedBirthday = new Date(this.data.birthday)
          .toISOString()
          .split('T')[0];
        this.userForm.patchValue({ birthday: formattedBirthday });
      }
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: [this.data?.username || '', Validators.required],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      password: [this.data?.password || '', Validators.required],
      name: [this.data?.name || '', Validators.required],
      surname: [this.data?.surname || '', Validators.required],
      phone: [this.data?.phone || '', Validators.required],
      address: [this.data?.address || '', Validators.required],
      bloodType: [this.data?.bloodType || '', Validators.required],
      birthday: [this.data?.birthday || '', Validators.required],
      sex: [this.data?.sex || 'MALE', Validators.required],
      subjects: [this.data?.subjects || [], Validators.required],
      id: [this.data?.id || ''],
    });
  }

  onImageUploaded(url: string | undefined): void {
    this.imgUrl.set(url);
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      const payload = {
        ...formValue,
        img: this.imgUrl(),
      };

      const action =
        this.type === 'create'
          ? this.userService.createUsuario(payload)
          : this.userService.updateUsuario(payload);

      action.subscribe({
        next: () => {
          this.state.set({ success: true, error: false });
          console.info(
            `Trabajador ha sido ${
              this.type === 'create' ? 'creado' : 'actualizado'
            }!`
          );
          this.setOpen.emit(false);
          this.router.navigate(['/teachers']); // Ajusta la ruta si es necesario
        },
        error: (err) => {
          this.state.set({ success: false, error: true });
          console.error('Ha ocurrido un fallo!');
          console.error(err);
        },
      });
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}

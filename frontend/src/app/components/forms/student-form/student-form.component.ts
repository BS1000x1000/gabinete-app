import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';

// Asume que este es un servicio que maneja las peticiones HTTP
import { StudentService } from '../../../services/student.service';
// Asume un componente para los campos del formulario
import { InputFieldComponent } from '../../../shared/components/input/input.component';
// Asume un componente o directiva para la carga de archivos

import { Router } from '@angular/router';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputFieldComponent,
  ],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnInit, OnChanges {
  @Input() type: 'create' | 'update' = 'create';
  @Input() data: any;
  @Input() relatedData: any;
  @Output() setOpen = new EventEmitter<boolean>();

  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private router = inject(Router);

  // Formulario reactivo
  studentForm!: FormGroup;

  // Estado del componente
  imgUrl = signal<string | undefined>(undefined);
  state = signal<{ success: boolean; error: boolean }>({
    success: false,
    error: false,
  });

  // Constructor para inicializar el formulario
  ngOnInit(): void {
    this.initForm();
  }

  // Hook para detectar cambios en las propiedades de entrada
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.initForm();
      if (this.data.birthday) {
        // Formatear la fecha para el input de tipo 'date'
        const formattedBirthday = new Date(this.data.birthday).toISOString().split('T')[0];
        this.studentForm.patchValue({ birthday: formattedBirthday });
      }
    }
  }

  // Inicializar el formulario con valores y validadores
  initForm(): void {
    this.studentForm = this.fb.group({
      username: [this.data?.username || '', Validators.required],
      email: [this.data?.email || '', [Validators.required, Validators.email]],
      password: [this.data?.password || '', Validators.required],
      name: [this.data?.name || '', Validators.required],
      surname: [this.data?.surname || '', Validators.required],
      phone: [this.data?.phone || '', Validators.required],
      address: [this.data?.address || '', Validators.required],
      bloodType: [this.data?.bloodType || '', Validators.required],
      birthday: [this.data?.birthday || '', Validators.required],
      parentId: [this.data?.parentId || '', Validators.required],
      sex: [this.data?.sex || 'MALE', Validators.required],
      gradeId: [this.data?.gradeId || '', Validators.required],
      classId: [this.data?.classId || '', Validators.required],
      id: [this.data?.id || '']
    });
  }

  // Manejador de la subida de imagen
  onImageUploaded(url: string | undefined): void {
    this.imgUrl.set(url);
  }

  // Envío del formulario
  onSubmit(): void {
    if (this.studentForm.valid) {
      const formValue = this.studentForm.value;
      const payload = {
        ...formValue,
        img: this.imgUrl(),
      };

      const action = this.type === 'create'
        ? this.studentService.createStudent(payload)
        : this.studentService.updateStudent(payload);

      action.subscribe({
        next: () => {
          this.state.set({ success: true, error: false });
          console.info(`Estudiante ha sido ${this.type === 'create' ? 'creado' : 'actualizado'}!`)
          this.setOpen.emit(false);
          this.router.navigate(['/students']); // Ajusta la ruta si es necesario
        },
        error: (err) => {
          this.state.set({ success: false, error: true });
          console.error('Ha surgido un error');
          console.error(err);
        }
      });
    } else {
      // Marcar todos los campos como 'touched' para mostrar los errores
      this.studentForm.markAllAsTouched();
    }
  }
}
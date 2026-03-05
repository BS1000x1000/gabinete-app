import {
  Component, inject, signal, computed, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

function confirmMatchValidator(group: AbstractControl): ValidationErrors | null {
  const a = group.get('newPassword')?.value;
  const b = group.get('confirmPassword')?.value;
  return a === b ? null : { mismatch: true };
}

function computeStrength(pwd: string): { level: number; label: string; color: string } {
  if (!pwd) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)   score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (pwd.length >= 12)  score++;
  if (score <= 1) return { level: 1, label: 'Debil',   color: '#ef4444' };
  if (score === 2) return { level: 2, label: 'Regular', color: '#f59e0b' };
  if (score === 3) return { level: 3, label: 'Buena',   color: '#3b82f6' };
  return                  { level: 4, label: 'Fuerte',  color: '#10b981' };
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-ajustes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ajustes.component.html',
})
export class AjustesComponent implements OnInit {
  private auth = inject(AuthService);
  private fb   = inject(FormBuilder);

  user        = this.auth.currentUser;
  userInitials = this.auth.userInitials;
  userName     = this.auth.userName;

  formState   = signal<FormState>('idle');
  serverError = signal<string | null>(null);
  hideCurrent = signal(true);
  hideNew     = signal(true);
  hideConfirm = signal(true);

  private _newPwdValue = signal('');
  strength = computed(() => computeStrength(this._newPwdValue()));

  securityForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8),
                           Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', Validators.required],
  }, { validators: confirmMatchValidator });

  get passwordsMatch(): boolean {
    const a = this.securityForm.get('newPassword')?.value;
    const b = this.securityForm.get('confirmPassword')?.value;
    return !!b && a === b;
  }

  private pwdSub: any;

  ngOnInit() {
    this.pwdSub = this.securityForm.get('newPassword')!.valueChanges
      .subscribe(v => this._newPwdValue.set(v ?? ''));
  }

  ngOnDestroy() {
    if (this.pwdSub) this.pwdSub.unsubscribe();
  }

  onChangePassword() {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      return;
    }

    this.formState.set('loading');
    this.serverError.set(null);

    const { currentPassword, newPassword } = this.securityForm.value;

    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.formState.set('success');
        this.securityForm.reset();
        this._newPwdValue.set('');
        setTimeout(() => this.formState.set('idle'), 4000);
      },
      error: (err) => {
        this.formState.set('error');
        const msg = err?.error?.data?.message || err?.error?.message;
        this.serverError.set(msg || 'Error al cambiar la contrasena. Verifica tu contrasena actual.');
        setTimeout(() => this.formState.set('idle'), 5000);
      },
    });
  }
}

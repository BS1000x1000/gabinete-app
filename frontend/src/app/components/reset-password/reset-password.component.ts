import {
  Component, inject, signal, computed, OnInit, OnDestroy
} from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

type State = 'idle' | 'loading' | 'success' | 'error' | 'no-token';

function confirmMatchValidator(group: AbstractControl): ValidationErrors | null {
  const a = group.get('newPassword')?.value;
  const b = group.get('confirmPassword')?.value;
  return a === b ? null : { mismatch: true };
}

function computeStrength(pwd: string): { level: number; label: string; color: string } {
  if (!pwd) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (pwd.length >= 12)         score++;
  if (score <= 1) return { level: 1, label: 'Debil',   color: '#ef4444' };
  if (score === 2) return { level: 2, label: 'Regular', color: '#f59e0b' };
  if (score === 3) return { level: 3, label: 'Buena',   color: '#3b82f6' };
  return                        { level: 4, label: 'Fuerte',  color: '#10b981' };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private auth    = inject(AuthService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);
  private fb      = inject(FormBuilder);

  state       = signal<State>('idle');
  serverError = signal<string | null>(null);
  countdown   = signal(3);
  hidePwd     = signal(true);
  hideConfirm = signal(true);
  currentYear = new Date().getFullYear();

  private token = '';
  private countdownInterval: any;
  private pwdSub: any;

  // Track password value for strength indicator
  private _pwdValue = signal('');

  strength = computed(() => computeStrength(this._pwdValue()));

  form: FormGroup = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(8),
                           Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', Validators.required],
  }, { validators: confirmMatchValidator });

  get passwordsMatch(): boolean {
    const a = this.form.get('newPassword')?.value;
    const b = this.form.get('confirmPassword')?.value;
    return !!b && a === b;
  }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('no-token');
      return;
    }
    this.token = token;

    this.pwdSub = this.form.get('newPassword')!.valueChanges
      .subscribe(v => this._pwdValue.set(v ?? ''));
  }

  ngOnDestroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.pwdSub) this.pwdSub.unsubscribe();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.state.set('loading');
    this.serverError.set(null);

    this.auth.resetPassword(this.token, this.form.value.newPassword).subscribe({
      next: () => {
        this.state.set('success');
        this.startCountdown();
      },
      error: (err) => {
        this.state.set('error');
        const msg = err?.error?.data?.message || err?.error?.message;
        this.serverError.set(msg || 'El enlace ha expirado o no es valido.');
      },
    });
  }

  private startCountdown() {
    let n = 3;
    this.countdown.set(n);
    this.countdownInterval = setInterval(() => {
      n--;
      this.countdown.set(n);
      if (n === 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }
}

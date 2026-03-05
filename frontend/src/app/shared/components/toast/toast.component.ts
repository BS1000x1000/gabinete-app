import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  toast = inject(ToastService);

  icon(type: string): string {
    const icons: Record<string, string> = {
      success: 'bi-check-circle-fill',
      error:   'bi-x-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info:    'bi-info-circle-fill',
    };
    return icons[type] ?? 'bi-info-circle-fill';
  }

  trackById(_: number, t: Toast): number {
    return t.id;
  }
}

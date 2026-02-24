import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-field',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="data-field" [class.full-width]="fullWidth">
      <label class="data-field-label">
        <i *ngIf="icon" class="bi" [ngClass]="icon"></i>
        {{ label }}
      </label>
      <div class="data-field-value" [class.empty]="!value">
        <ng-container *ngIf="value; else emptyState">
          <span *ngIf="type === 'text'">{{ value }}</span>
          <span *ngIf="type === 'badge'" class="badge" [ngClass]="badgeClass">
            {{ value }}
          </span>
          <span *ngIf="type === 'date'">{{ value | date: 'dd/MM/yyyy' }}</span>
          <span *ngIf="type === 'email'" class="text-break">{{ value }}</span>
          <span *ngIf="type === 'phone'">
            <i class="bi bi-telephone me-1"></i>{{ value }}
          </span>
          <ng-container *ngIf="type === 'list'">
            <span *ngFor="let item of value" class="badge bg-secondary me-1">
              {{ item }}
            </span>
          </ng-container>
        </ng-container>
        <ng-template #emptyState>
          <span class="text-muted fst-italic">{{ emptyText }}</span>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .data-field {
      margin-bottom: 1rem;
    }

    .data-field-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #6c757d;
      margin-bottom: 0.375rem;

      i {
        margin-right: 0.375rem;
        color: #0d6efd;
      }
    }

    .data-field-value {
      padding: 0.625rem 0.875rem;
      background: #f8f9fa;
      border-left: 3px solid #dee2e6;
      border-radius: 0.375rem;
      font-size: 0.9375rem;
      min-height: 2.5rem;
      display: flex;
      align-items: center;

      &.empty {
        background: #fff;
        border-left-color: #e9ecef;
      }
    }

    .data-field.full-width {
      grid-column: 1 / -1;
    }

    .text-break {
      word-break: break-word;
    }
  `]
})
export class DataFieldComponent {
  @Input() label: string = '';
  @Input() value: any = null;
  @Input() type: 'text' | 'badge' | 'date' | 'email' | 'phone' | 'list' = 'text';
  @Input() icon?: string;
  @Input() badgeClass: string = 'bg-success';
  @Input() emptyText: string = 'No registrado';
  @Input() fullWidth: boolean = false;
}
import {
  Component,
  DestroyRef,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExportService } from '../../../services/export.service';

@Component({
  selector: 'app-historial-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-modal.component.html',
})
export class HistorialModalComponent {
  @Input({ required: true }) clienteId!: string;
  @Output() cerrar = new EventEmitter<void>();

  private exportService = inject(ExportService);
  private readonly destroyRef = inject(DestroyRef);

  tipo          = signal<'sesiones' | 'bonos'>('sesiones');
  fechaDesde    = signal('');
  fechaHasta    = signal('');
  todosClientes = signal(false);
  formato       = signal<'pdf' | 'excel'>('pdf');
  isLoading     = signal(false);
  error         = signal('');

  showAllClients = computed(() => this.tipo() === 'bonos');

  exportar(): void {
    this.error.set('');
    this.isLoading.set(true);

    const params = {
      formato: this.formato(),
      desde: this.fechaDesde() || undefined,
      hasta: this.fechaHasta() || undefined,
    };

    const obs$ = this.tipo() === 'sesiones'
      ? this.exportService.exportSesiones(this.clienteId, params)
      : this.exportService.exportBonos(
          this.todosClientes() ? null : this.clienteId,
          params,
        );

    obs$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: () => this.cerrar.emit(),
        error: () => this.error.set('Error al generar el archivo. Inténtalo de nuevo.'),
      });
  }
}

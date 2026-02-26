import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-informes-tab',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tab-content-modern p-4">
      <div class="d-flex flex-column align-items-center justify-content-center py-5 text-center">
        <div style="width:64px;height:64px;border-radius:16px;background:#f1f5ff;display:flex;align-items:center;justify-content:center;margin-bottom:1rem;">
          <i class="bi bi-file-earmark-text" style="font-size:1.8rem;color:#6366f1;"></i>
        </div>
        <h6 class="fw-bold mb-1">Informes</h6>
        <p class="text-muted small mb-0">
          Aquí podrás generar el <strong>Informe Inicial</strong> y los <strong>Informes de Seguimiento</strong> del alumno.<br>
          Próximamente disponible.
        </p>
      </div>
    </div>
  `,
})
export class InformesTabComponent {}

export default InformesTabComponent;
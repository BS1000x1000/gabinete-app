import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroTabComponent } from '../registro-tab/registro-tab.component';
import { ObjetivosTabComponent } from '../objetivos-tab/objetivos-tab.component';

@Component({
  standalone: true,
  selector: 'app-progreso-tab',
  imports: [CommonModule, RegistroTabComponent, ObjetivosTabComponent],
  templateUrl: './progreso-tab.component.html',
})
export class ProgresoTabComponent {
  vista = signal<'registro' | 'objetivos'>('registro');
}

export default ProgresoTabComponent;

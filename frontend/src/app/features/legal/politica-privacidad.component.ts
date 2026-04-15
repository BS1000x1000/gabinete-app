import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './politica-privacidad.component.html',
})
export class PoliticaPrivacidadComponent {
  readonly fechaActualizacion = 'Abril 2026';
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aviso-legal',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './aviso-legal.component.html',
})
export class AvisoLegalComponent {
  readonly fechaActualizacion = 'Abril 2026';
}

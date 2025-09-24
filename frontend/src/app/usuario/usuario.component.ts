import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BigCalendarContainerComponent } from '../shared/components/big-calendar-container/big-calendar-container.component';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, BigCalendarContainerComponent],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss',
})
export class UsuarioComponent { }

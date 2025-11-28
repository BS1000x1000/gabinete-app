import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AgendaComponent } from './agenda/agenda.component';
import { ClientesService } from '../../services/cliente.service';
import { ClienteData } from '../../../interface/cliente.interface';
import { TurnosService } from '../../services/turnos.service';

// src/app/features/home/home.component.ts
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    RouterLinkActive,
    AgendaComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private clientesSvc = inject(ClientesService);
  private agendaSvc = inject(TurnosService);
  clientes: ClienteData[] = [];
  constructor() {}

  ngOnInit() {
    this.getClientes();
  }

  getClientes() {
    this.clientesSvc.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        console.log(this.clientes);
      },
      error: (error) => {
        console.error('Error al cargar', error);
      },
    });
  }

}

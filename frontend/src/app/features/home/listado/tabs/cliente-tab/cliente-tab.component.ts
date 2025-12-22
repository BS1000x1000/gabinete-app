import { Component, effect, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TurnosService } from '../../../../../services/turnos.service';
import { TurnoAgenda } from '../../../../../models/turno.model';
import { HorarioData } from '../../../../../../interface/horario.interface';
import { ClientesService } from '../../../../../services/cliente.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-cliente-tab',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './cliente-tab.component.html',
  styleUrl: './cliente-tab.component.scss',
})
export class ClienteTabComponent implements OnInit {
  private turnosSvc = inject(TurnosService);
  public horario = signal<any | null>(null); // falta la interface de Cliente

  private clienteSvc = inject(ClientesService);
  public cliente = this.clienteSvc.cliente;
  public contactos = this.clienteSvc.contactos;

  constructor(private activatedRoute: ActivatedRoute) {
    effect(() => {
      const clienteActual = this.cliente();
      const contactosActuales = this.contactos();
      console.log(clienteActual);
      console.log(contactosActuales);
    })
  }

  ngOnInit(): void {
    this.getDatos();;
  }

  getDatos() {
    console.log(this.activatedRoute);
    const id = String(
      this.activatedRoute.parent?.snapshot.paramMap.get('id')
    );
    const turno = this.turnosSvc.turnos().find((t: HorarioData) => t.id === id);
    if (turno) this.horario.set(turno);
  }
}

export default ClienteTabComponent;

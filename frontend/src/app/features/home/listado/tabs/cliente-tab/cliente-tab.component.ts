import { Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TurnosService } from '../../../../../services/turnos.service';
import { TurnoAgenda } from '../../../../../models/turno.model';

@Component({
  selector: 'app-cliente-tab',
  standalone: true,
  imports: [],
  templateUrl: './cliente-tab.component.html',
  styleUrl: './cliente-tab.component.scss',
})
export class ClienteTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private turnosSvc = inject(TurnosService);
  public cliente = signal<any | null>(null); // falta la interface de Cliente

  ngOnInit(): void {
    const id = Number(
      inject(ActivatedRoute).parent?.snapshot.paramMap.get('id')
    );
    const turno = this.turnosSvc.turnos().find((t: TurnoAgenda) => t.id === id);
    if (turno) this.cliente.set(turno);
  }
}

export default ClienteTabComponent;

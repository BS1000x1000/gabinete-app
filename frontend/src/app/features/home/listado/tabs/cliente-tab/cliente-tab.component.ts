import { Component, inject, signal, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TurnosService } from '../../../../../services/turnos.service';
import { TurnoAgenda } from '../../../../../models/turno.model';
import { HorarioData } from '../../../../../../interface/horario.interface';

@Component({
  selector: 'app-cliente-tab',
  standalone: true,
  imports: [],
  templateUrl: './cliente-tab.component.html',
  styleUrl: './cliente-tab.component.scss',
})
export class ClienteTabComponent implements OnInit {
  private turnosSvc = inject(TurnosService);
  public horario = signal<any | null>(null); // falta la interface de Cliente

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.getDatos();
  }

  getDatos() {
    console.log(this.activatedRoute);
    const id = String(
      this.activatedRoute.parent?.snapshot.paramMap.get('id')
    );
    const turno = this.turnosSvc.turnos().find((t: HorarioData) => t.id === id);
    if (turno) this.horario.set(turno);
    console.log(this.horario());
  }
}

export default ClienteTabComponent;

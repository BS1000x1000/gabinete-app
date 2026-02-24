import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SesionesService } from '../../services/sesiones.service';
import { AuthService } from '../../services/auth.service';
import { SesionData } from '../../interface/sesion.interface';

@Component({
  selector: 'app-agenda-compact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda-compact.component.html',
})
export class AgendaCompactComponent implements OnInit {
  private sesionesSvc = inject(SesionesService);
  private auth = inject(AuthService);
  private router = inject(Router);

  sesiones = this.sesionesSvc.sesiones;
  isLoading = this.sesionesSvc.isLoading;
  expandido = signal(false);

  // Computed
  sesionesHoy = computed(() => {
    const hoy = new Date().toDateString();
    return this.sesiones().filter(s => {
      const fecha = new Date(s.fechaHoraInicio).toDateString();
      return fecha === hoy;
    });
  });

  proximaSesion = computed(() => {
    const ahora = new Date().getTime();
    return this.sesionesHoy().find(s => {
      const inicio = new Date(s.fechaHoraInicio).getTime();
      return inicio > ahora && s.estado === 'PROGRAMADA';
    });
  });

  sesionesCompletadas = computed(() => 
    this.sesionesHoy().filter(s => s.estado === 'COMPLETADA').length
  );

  sesionesProgramadas = computed(() => 
    this.sesionesHoy().filter(s => s.estado === 'PROGRAMADA').length
  );

  ngOnInit() {
    this.cargarSesiones();
  }

  cargarSesiones() {
    const trabajadorId = this.auth.currentTrabajadorId();
    if (!trabajadorId) return;

    const hoy = new Date().toISOString().split('T')[0];
    this.sesionesSvc.getSesionesByTrabajador(hoy, hoy).subscribe();
  }

  toggleExpand() {
    this.expandido.update(v => !v);
  }

  verAgendaCompleta() {
    this.router.navigate(['/home/agenda']);
  }

  verCliente(sesion: SesionData) {
    this.router.navigate(['/home/listado', sesion.clienteId, 'cliente']);
  }

  completarSesion(id: string, event: Event) {
    event.stopPropagation();
    this.sesionesSvc.completarSesion(id, { notas: 'Completada' }).subscribe({
      next: () => this.cargarSesiones()
    });
  }
}
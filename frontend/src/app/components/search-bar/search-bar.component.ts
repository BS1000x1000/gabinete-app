import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientesService } from '../../services/cliente.service';
import { InformesService } from '../../services/informes.service';
import Fuse from 'fuse.js';
import { calcularEdad } from '../../shared/utils/date';

// ── Tipos de resultado ────────────────────────────────────────────
export type TipoResultado = 'cliente' | 'informe' | 'sesion';

export interface ResultadoSearch {
  tipo: TipoResultado;
  id: string;
  clienteId: string;
  titulo: string;
  subtitulo: string;
  ruta: string[];
  iniciales?: string;
}

// ── Índices de búsqueda internos ─────────────────────────────────
interface ClienteIndex {
  id: string;
  nombre: string;
  apellidos: string;
  dni?: string;
  curso?: string;
  edad?: number;
}

interface InformeIndex {
  id: string;
  titulo: string;
  tipo: string;
  estado: string;
  tipoLabel: string;
  estadoLabel: string;
  clienteId: string;
  clienteNombre: string;
  clienteApellidos: string;
}

const TIPO_LABEL: Record<string, string> = {
  INICIAL: 'Informe inicial',
  SEGUIMIENTO: 'Seguimiento',
};

const ESTADO_LABEL: Record<string, string> = {
  BORRADOR: 'Borrador',
  REVISION: 'En revisión',
  FINALIZADO: 'Finalizado',
};

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent implements OnInit, OnDestroy {
  private clientesSvc = inject(ClientesService);
  private informesSvc = inject(InformesService);
  private router = inject(Router);

  searchTerm = signal('');
  isOpen = signal(false);
  selectedIndex = signal(0);

  private fuseClientes!: Fuse<ClienteIndex>;
  private fuseInformes!: Fuse<InformeIndex>;

  // ── Resultados por categoría ──────────────────────────────────
  clienteResultados = computed<ResultadoSearch[]>(() => {
    const term = this.searchTerm().trim();
    if (!term || term.length < 2 || !this.fuseClientes) return [];
    return this.fuseClientes.search(term, { limit: 4 }).map((r) => ({
      tipo: 'cliente' as TipoResultado,
      id: r.item.id,
      clienteId: r.item.id,
      titulo: `${r.item.apellidos}, ${r.item.nombre}`,
      subtitulo: [
        r.item.edad ? `${r.item.edad} años` : null,
        r.item.curso ?? null,
        r.item.dni ? `DNI: ${r.item.dni}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      ruta: ['/home/listado', r.item.id, 'perfil'],
      iniciales: `${r.item.nombre.charAt(0)}${r.item.apellidos.charAt(0)}`,
    }));
  });

  informeResultados = computed<ResultadoSearch[]>(() => {
    const term = this.searchTerm().trim();
    if (!term || term.length < 2 || !this.fuseInformes) return [];
    return this.fuseInformes.search(term, { limit: 3 }).map((r) => ({
      tipo: 'informe' as TipoResultado,
      id: r.item.id,
      clienteId: r.item.clienteId,
      titulo: r.item.titulo,
      subtitulo: `${r.item.tipoLabel} · ${r.item.estadoLabel} · ${r.item.clienteApellidos}, ${r.item.clienteNombre}`,
      ruta: ['/home/listado', r.item.clienteId, 'informes'],
    }));
  });

  // Accesos directos a sesiones, derivados de los top 2 clientes encontrados
  sesionResultados = computed<ResultadoSearch[]>(() => {
    return this.clienteResultados()
      .slice(0, 2)
      .map((c) => ({
        tipo: 'sesion' as TipoResultado,
        id: `sesion-${c.clienteId}`,
        clienteId: c.clienteId,
        titulo: `Sesiones de ${c.titulo.split(', ').reverse().join(' ')}`,
        subtitulo: 'Ver historial de sesiones',
        ruta: ['/home/listado', c.clienteId, 'sesiones'],
      }));
  });

  // Lista plana para navegación por teclado
  todosResultados = computed<ResultadoSearch[]>(() => [
    ...this.clienteResultados(),
    ...this.informeResultados(),
    ...this.sesionResultados(),
  ]);

  hayResultados = computed(
    () =>
      this.clienteResultados().length > 0 ||
      this.informeResultados().length > 0,
  );

  // ── Índice global para highlighting en la plantilla ──────────
  indexEnGrupo(grupo: ResultadoSearch[], offsetGrupo: number, i: number) {
    return offsetGrupo + i;
  }

  offsetClientes = computed(() => 0);
  offsetInformes = computed(() => this.clienteResultados().length);
  offsetSesiones = computed(
    () => this.clienteResultados().length + this.informeResultados().length,
  );

  // ── Ciclo de vida ─────────────────────────────────────────────
  private readonly keydownHandler = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      this.toggleSearch();
    }
    if (e.key === 'Escape' && this.isOpen()) {
      this.cerrarBusqueda();
    }
    if (this.isOpen() && this.todosResultados().length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedIndex.update((i) =>
          i < this.todosResultados().length - 1 ? i + 1 : i,
        );
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedIndex.update((i) => (i > 0 ? i - 1 : 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = this.todosResultados()[this.selectedIndex()];
        if (selected) this.seleccionar(selected);
      }
    }
  };

  ngOnInit() {
    this.fuseClientes = new Fuse<ClienteIndex>([], {
      keys: [
        { name: 'nombre', weight: 2 },
        { name: 'apellidos', weight: 2 },
        { name: 'dni', weight: 1 },
        { name: 'curso', weight: 0.5 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });

    this.fuseInformes = new Fuse<InformeIndex>([], {
      keys: [
        { name: 'titulo', weight: 2 },
        { name: 'clienteNombre', weight: 2 },
        { name: 'clienteApellidos', weight: 2 },
        { name: 'tipoLabel', weight: 1 },
        { name: 'estadoLabel', weight: 0.5 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });

    this.cargarClientes();
    this.cargarInformes();
    document.addEventListener('keydown', this.keydownHandler);
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.keydownHandler);
  }

  // ── Carga de datos ────────────────────────────────────────────
  private cargarClientes() {
    this.clientesSvc.getAll().subscribe({
      next: (clientes) => {
        const index = clientes.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          apellidos: c.apellidos,
          dni: c.dni,
          curso: c.curso,
          edad: calcularEdad(c.fechaNacimiento),
        }));
        this.fuseClientes.setCollection(index);
      },
    });
  }

  private cargarInformes() {
    this.informesSvc.getAll().subscribe({
      next: (informes) => {
        const index: InformeIndex[] = informes
          .filter((inf) => inf.cliente)
          .map((inf) => ({
            id: inf.id,
            titulo: inf.titulo,
            tipo: inf.tipoInforme,
            estado: inf.estado,
            tipoLabel: TIPO_LABEL[inf.tipoInforme] ?? inf.tipoInforme,
            estadoLabel: ESTADO_LABEL[inf.estado] ?? inf.estado,
            clienteId: inf.clienteId,
            clienteNombre: inf.cliente!.nombre,
            clienteApellidos: inf.cliente!.apellidos,
          }));
        this.fuseInformes.setCollection(index);
      },
    });
  }

  // ── Control del modal ─────────────────────────────────────────
  abrirBusqueda(caracterInicial?: string) {
    if (this.isOpen()) return;
    if (caracterInicial) {
      this.searchTerm.set(caracterInicial);
      this.selectedIndex.set(0);
    }
    this.isOpen.set(true);
    setTimeout(() => {
      const input = document.getElementById('search-input') as HTMLInputElement;
      if (input) {
        input.focus();
        const len = input.value.length;
        input.setSelectionRange(len, len);
      }
    }, 50);
  }

  onTriggerKeydown(e: KeyboardEvent) {
    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
      e.preventDefault();
      this.abrirBusqueda(e.key);
    }
  }

  toggleSearch() {
    if (this.isOpen()) {
      this.cerrarBusqueda();
    } else {
      this.abrirBusqueda();
    }
  }

  cerrarBusqueda() {
    this.isOpen.set(false);
    this.searchTerm.set('');
    this.selectedIndex.set(0);
  }

  seleccionar(resultado: ResultadoSearch) {
    this.cerrarBusqueda();
    this.router.navigate(resultado.ruta);
  }
}

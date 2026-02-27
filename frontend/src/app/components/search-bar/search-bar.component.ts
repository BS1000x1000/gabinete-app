import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientesService } from '../../services/cliente.service';
import Fuse from 'fuse.js';
import { calcularEdad, calcularEdadTexto } from '../../shared/utils/date';

interface ClienteSearch {
  id: string;
  nombre: string;
  apellidos: string;
  dni?: string;
  curso?: string;
  edad?: number;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent implements OnInit {
  private clientesSvc = inject(ClientesService);
  private router = inject(Router);

  searchTerm = signal('');
  isOpen = signal(false);
  clientes = signal<ClienteSearch[]>([]);
  selectedIndex = signal(0);

  // Configuración de Fuse.js para búsqueda fuzzy
  private fuse!: Fuse<ClienteSearch>;

  resultados = computed(() => {
    const term = this.searchTerm().trim();
    if (!term || term.length < 2) return [];

    const results = this.fuse.search(term, { limit: 8 });
    return results.map(r => r.item);
  });

  ngOnInit() {
    this.cargarClientes();
    this.setupKeyboardShortcuts();
  }

  cargarClientes() {
    this.clientesSvc.getAll().subscribe({
      next: (clientes) => {
        console.log(clientes);
        const clientesSearch = clientes.map(c => ({
          id: c.id,
          nombre: c.nombre,
          apellidos: c.apellidos,
          dni: c.dni,
          curso: c.curso,
          edad: calcularEdad(c.fechaNacimiento),
          edadTexto: calcularEdadTexto(c.fechaNacimiento).texto
        }));

        this.clientes.set(clientesSearch);

        // Configurar Fuse.js
        this.fuse = new Fuse(clientesSearch, {
          keys: [
            { name: 'nombre', weight: 2 },
            { name: 'apellidos', weight: 2 },
            { name: 'dni', weight: 1 },
            { name: 'curso', weight: 0.5 }
          ],
          threshold: 0.3,
          ignoreLocation: true
        });
      }
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+K o Cmd+K para abrir búsqueda
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggleSearch();
      }

      // Escape para cerrar
      if (e.key === 'Escape' && this.isOpen()) {
        this.cerrarBusqueda();
      }

      // Flechas para navegar
      if (this.isOpen() && this.resultados().length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedIndex.update(i => 
            i < this.resultados().length - 1 ? i + 1 : i
          );
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedIndex.update(i => i > 0 ? i - 1 : 0);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          const selected = this.resultados()[this.selectedIndex()];
          if (selected) this.seleccionarCliente(selected);
        }
      }
    });
  }

  toggleSearch() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  }

  cerrarBusqueda() {
    this.isOpen.set(false);
    this.searchTerm.set('');
    this.selectedIndex.set(0);
  }

  seleccionarCliente(cliente: ClienteSearch) {
    this.cerrarBusqueda();
    this.router.navigate(['/home/listado', cliente.id, 'cliente']);
  }
}
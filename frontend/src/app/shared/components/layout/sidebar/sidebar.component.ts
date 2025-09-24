import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

// Asume que este es un servicio de autenticación
import { AuthService, User } from '../../../../services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { NgScrollbar } from 'ngx-scrollbar';

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  visible: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, NgScrollbar],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  private authService = inject(AuthService);

  private currentUser = toSignal(this.authService.getCurrentUser());

  // Define la lista de todos los items
  private allMenuItems: MenuItem[] = [
    {
      icon: 'house',
      label: 'Inicio',
      href: '/',
      visible: ['admin', 'teacher', 'student', 'parent'],
    },
    {
      icon: 'person-fill',
      label: 'Ficha',
      href: '/list/teachers',
      visible: ['admin', 'teacher'],
    },
    {
      icon: 'people',
      label: 'Clientes',
      href: '/list/students',
      visible: ['admin', 'teacher'],
    },
    {
      icon: 'journals',
      label: 'Documentacion',
      href: '/list/lessons',
      visible: ['admin', 'teacher'],
    }
  ];

  public visibleMenuItems = computed(() => {
    const user = this.currentUser();
    if (!user || !user.role) {
      return [];
    }
    return this.allMenuItems.filter((item) =>
      item.visible.includes(user.role as string)
    );
  });

  onSelect(_t31: any) {
    console.log('Item seleccionado:', _t31);
  }

  ngOnInit(): void {}
}

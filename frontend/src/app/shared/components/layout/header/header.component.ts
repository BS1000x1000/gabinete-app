/* header.component.ts */
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderService } from '../../../../services/header.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private router = inject(Router);
  header = inject(HeaderService);

  @Input() userName = 'Nombre';
  @Input() userSurname = 'Apellido';
  @Input() role = 'admin';

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  openNotifications(){}
}
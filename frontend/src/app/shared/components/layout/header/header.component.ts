/* header.component.ts */
import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderService } from '../../../../services/header.service';
import { AuthService } from '../../../../services/auth.service';
import { NotificationBellComponent } from '../../notification-bell/notification-bell.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NotificationBellComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  header = inject(HeaderService);
  private auth = inject(AuthService);

  @Input() userName = 'Nombre';
  @Input() userSurname = 'Apellido';
  @Input() role = 'admin';

  logout() {
    this.auth.logout();
  }
}

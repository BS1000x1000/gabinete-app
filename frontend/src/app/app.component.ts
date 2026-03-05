import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/layout/sidebar/sidebar.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { FooterComponent } from './shared/components/layout/footer/footer.component';
import { HeaderComponent } from './shared/components/layout/header/header.component';
import { SidebarService } from './services/sidebar.service';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ReactiveFormsModule,
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    ToastComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  public sidebar = inject(SidebarService);
}

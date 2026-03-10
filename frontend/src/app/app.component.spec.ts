import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, RouterOutlet } from '@angular/router';
import { Component } from '@angular/core';

import { AppComponent } from './app.component';

// Stubs para componentes de layout con dependencias complejas
@Component({ selector: 'app-sidebar', standalone: true, template: '' })
class SidebarStub {}

@Component({ selector: 'app-header', standalone: true, template: '' })
class HeaderStub {}

@Component({ selector: 'app-toast', standalone: true, template: '' })
class ToastStub {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
      .overrideComponent(AppComponent, {
        set: {
          imports: [RouterOutlet, SidebarStub, HeaderStub, ToastStub],
        },
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have the sidebar service injected', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.sidebar).toBeDefined();
  });
});

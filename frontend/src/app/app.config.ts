import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideQuillConfig, QuillModule } from 'ngx-quill';
import { authInterceptor } from './shared/utils/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      CalendarModule.forRoot({
        provide: DateAdapter,
        useFactory: adapterFactory,
      }),
      QuillModule.forRoot(),
    ),
    provideQuillConfig({
      modules: {
        syntax: false,
        toolbar: [
          ['bold', 'italic'], // toggled buttons
          ['image'],

          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }], // outdent/indent

          [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
          [{ header: [1, 2, 3, 4, 5, 6, false] }],

          [{ align: [] }],

        ],
      },
    }),
  ],
};

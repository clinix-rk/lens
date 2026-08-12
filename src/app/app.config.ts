import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { APP_DATE_FORMATS } from './shared/date-formats';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    provideMomentDateAdapter(APP_DATE_FORMATS),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
};


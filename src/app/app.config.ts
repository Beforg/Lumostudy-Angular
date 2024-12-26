import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch} from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNgxMask } from 'ngx-mask';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { routes } from './app.routes';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePt)

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideToastr({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    provideNgxMask(),
  ]
};

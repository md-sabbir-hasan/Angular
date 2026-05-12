import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './src/app/core/interceptors/auth-interceptor';
import { errorInterceptor } from './src/app/core/interceptors/error-interceptor';
import { loadingInterceptor } from './src/app/core/interceptors/loading-interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor,
        loadingInterceptor
      ])
    ),
    provideAnimationsAsync()
  ]
};
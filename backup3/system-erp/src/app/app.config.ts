import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './src/app/core/interceptors/auth-interceptor';
import { errorInterceptor } from './src/app/core/interceptors/error-interceptor';
import { loadingInterceptor } from './src/app/core/interceptors/loading-interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { financeRoutes } from './src/app/modules/finance/finance.routes';
import { routes } from './app.routes';


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
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // Do NOT add token to public auth endpoints
  const isPublicEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/token/refresh');

  const token = auth.getAccessToken();

  // Attach Bearer token to every private request
  const authReq = (token && !isPublicEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {

      // 401 on a non-auth endpoint → try to refresh the token
      if (err.status === 401 && !isPublicEndpoint) {
        return auth.refreshToken().pipe(
          switchMap(res => {
            // Retry the original request with the new token
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access}` },
            });
            return next(retried);
          }),
          catchError(refreshErr => {
            // Refresh failed — log out and redirect to login
            auth.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => err);
    })
  );
};

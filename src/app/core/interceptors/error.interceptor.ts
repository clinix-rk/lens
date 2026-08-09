import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error && typeof error.error === 'object') {
        const apiRes = error.error;
        if (apiRes.errors && Array.isArray(apiRes.errors)) {
          console.error(`[API Error ${apiRes.statusCode || error.status}] ${apiRes.message || error.message}:`, apiRes.errors);
        } else {
          console.error(`[API Error ${error.status}]:`, apiRes.message || error.message);
        }
      } else {
        console.error('[HTTP Error]:', error);
      }
      return throwError(() => error);
    })
  );
};

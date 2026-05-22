import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Functional HTTP interceptor that attaches the JWT token
 * to all outgoing requests (except login/register).
 * On 401, clears the token and redirects to login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    // Skip auth header for login and register endpoints
    const skipUrls = ['/login', '/register'];
    const shouldSkip = skipUrls.some(url => req.url.includes(url));

    let authReq = req;
    if (!shouldSkip) {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 || error.status === 403) {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('current_user');
                router.navigate(['/login']);
            }
            return throwError(() => error);
        })
    );
};

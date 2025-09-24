import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent/* , HttpErrorResponse */ } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isHandlingExpiration = false;

  constructor(private authService: AuthService, private router: Router ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (
      req.url.includes('/auth/login') ||
      req.url.includes('/auth/register') ||
      req.url.includes('/auth/forgot-password') ||
      req.url.includes('/auth/') ||
      req.url.includes('/auth/reset-password')){
      return next.handle(req);
    }

    if (token) {
      if (this.isTokenExpired(token)) {
        if (!this.isHandlingExpiration) {
          this.isHandlingExpiration = true;

          Swal.fire({
            icon: 'error',
            title: 'Sesión expirada',
            text: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
          }).then(() => {
            this.authService.logout();
            this.router.navigate(['/store']).then(() => {
              this.isHandlingExpiration = false;
            });
          });
        }

        return EMPTY;
      }
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return false;

      const now = Math.floor(Date.now() / 1000);
      console.log('exp:', exp, 'now:', now);
      return exp < now;
    } catch (e) {
      console.error('Error al decodificar el token:', e);
      return true;
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterRequest } from '../../shared/models/register-request';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private tokenTimer: any;

  private readonly _baseUrl = new BehaviorSubject<string>('http://localhost:8080');
  public readonly baseUrl$: Observable<string> = this._baseUrl.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkTokenExpiration();
  }

  setBaseUrl(newUrl: string) {
    this._baseUrl.next(newUrl);
  }

  getBaseUrl(): string {
    return this._baseUrl.getValue();
  }

  private get authBase(): string {
    return this.getBaseUrl() + '/auth';
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error al decodificar token', e);
      return null;
    }
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return false;

    const expiresAt = decoded.exp * 1000;
    return Date.now() < expiresAt;
  }

  private checkTokenExpiration() {
    const token = this.getToken();
    if (!token) return;

    const decoded = this.decodeToken(token);
    if (decoded?.exp) {
      const expiresAt = decoded.exp * 1000;
      this.scheduleTokenCheck(expiresAt);
    }
  }

  getUserName(): string {
    const token = this.getToken();
    if (!token) return '';
    return this.decodeToken(token)?.sub || '';
  }

  getUserRole(): string {
    const token = this.getToken();
    if (!token) return '';
    return this.decodeToken(token)?.role || '';
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeToken(token)?.userId || null;
  }

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  isSuperAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'SUPER_ADMIN';
  }

  isClient(): boolean {
    const role = this.getUserRole();
    return role === 'CLIENT';
  }

  getUserPermissions(): string[] {
    const token = this.getToken();
    if (!token) return [];
    return this.decodeToken(token)?.permissions || [];
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes('ALL_PERMISSION') || permissions.includes(permission);
  }

  hasAnyPermission(required: string[]): boolean {
    const permissions = this.getUserPermissions();
    return permissions.includes('ALL_PERMISSION') ||
           required.some(p => permissions.includes(p));
  }

  hasAllPermissions(required: string[]): boolean {
    const permissions = this.getUserPermissions();
    if (permissions.includes('ALL_PERMISSION')) return true;
    return required.every(p => permissions.includes(p));
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.authBase}/register`, data);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.authBase}/login`, { username, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);

          const decoded = this.decodeToken(response.token);
          if (decoded?.exp) {
            const expiresAt = decoded.exp * 1000;
            localStorage.setItem('token_exp', expiresAt.toString());
            this.scheduleTokenCheck(expiresAt);
          }

          if (response.user) {
            localStorage.setItem('user_data', JSON.stringify(response.user));
          }

          if (response.permissions) {
            localStorage.setItem('user_permissions', JSON.stringify(response.permissions));
          }

          if (decoded?.role) {
            localStorage.setItem('user_role', decoded.role);
          }

          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  logout() {
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
      this.tokenTimer = null;
    }

    localStorage.removeItem('token');
    localStorage.removeItem('token_exp');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_permissions');
    localStorage.removeItem('user_role');

    this.isAuthenticatedSubject.next(false);

    this.router.navigate(['/login']);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.authBase}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const body = {
      token: token,
      newPassword: newPassword
    };
    return this.http.post(`${this.authBase}/reset-password`, body);
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  getTokenExpiration(): number | null {
    const expStr = localStorage.getItem('token_exp');
    return expStr ? parseInt(expStr, 10) : null;
  }

  getRemainingTime(): number {
    const exp = this.getTokenExpiration();
    if (!exp) return 0;
    return Math.max(0, exp - Date.now());
  }

  private scheduleTokenCheck(expiresAt: number) {
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }

    const timeLeft = expiresAt - Date.now();

    if (timeLeft <= 0) {
      this.handleSessionExpired();
    } else {
      const checkTime = Math.max(0, timeLeft - 60000);

      this.tokenTimer = setTimeout(() => {
        const currentTimeLeft = expiresAt - Date.now();

        if (currentTimeLeft <= 60000) {
          this.showExpirationWarning(currentTimeLeft);
        }

        setTimeout(() => {
          this.handleSessionExpired();
        }, currentTimeLeft);
      }, checkTime);
    }
  }

  private showExpirationWarning(timeLeft: number) {
    const minutes = Math.floor(timeLeft / 60000);

    Swal.fire({
      icon: 'warning',
      title: 'Sesión por expirar',
      text: `Tu sesión expirará en ${minutes} minuto(s). Por favor, guarda tu trabajo.`,
      confirmButtonText: 'Entendido',
      timer: 10000,
      timerProgressBar: true
    });
  }

  private handleSessionExpired() {
    this.logout();

    Swal.fire({
      icon: 'warning',
      title: 'Sesión expirada',
      text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      confirmButtonText: 'Iniciar sesión',
      allowOutsideClick: false
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.authBase}/refresh-token`, {}).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);

          const decoded = this.decodeToken(response.token);
          if (decoded?.exp) {
            const expiresAt = decoded.exp * 1000;
            localStorage.setItem('token_exp', expiresAt.toString());
            this.scheduleTokenCheck(expiresAt);
          }
        }
      })
    );
  }

  canAccess(requiredPermissions: string[], requireAll: boolean = false): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }

    if (this.isSuperAdmin()) {
      return true;
    }

    if (requiredPermissions.length === 0) {
      return true;
    }

    return requireAll
      ? this.hasAllPermissions(requiredPermissions)
      : this.hasAnyPermission(requiredPermissions);
  }
}

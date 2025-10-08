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

  private readonly _baseUrl = new BehaviorSubject<string>('http://192.168.1.36:8080');
  public readonly baseUrl$: Observable<string> = this._baseUrl.asObservable();

  constructor( private http: HttpClient, private router: Router ) {}

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
        }
      })
    );
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
    return required.some(p => permissions.includes(p));
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private scheduleTokenCheck(expiresAt: number) {
    const timeLeft = expiresAt - Date.now();
    if (timeLeft <= 0) {
      this.handleSessionExpired();
    } else {
      this.tokenTimer = setTimeout(() => {
        this.handleSessionExpired();
      }, timeLeft);
    }
  }

  private handleSessionExpired() {
    this.logout();
    Swal.fire({
      icon: 'warning',
      title: 'Sesión expirada',
      text: 'Por favor, inicia sesión nuevamente',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      this.router.navigate(['/store']);
    });
  }
}

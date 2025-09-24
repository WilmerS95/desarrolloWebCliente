import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  /* getItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`);
  } */

  private get loanBase(): string {
    return this.authService.getBaseUrl() + '/loan-applications';
  }

  getCategories(): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.loanBase}/categories`, { headers });
  }

  createLoanApplication(formData: FormData): Observable<any> {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post(`${this.loanBase}`, formData, { headers });
    }
}

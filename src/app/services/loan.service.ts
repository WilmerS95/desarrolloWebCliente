import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'http://192.168.1.37:8080/loan-applications';

  constructor(private http: HttpClient, private authService: AuthService) {}

  /* getItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`);
  } */

  getCategories(): Observable<any[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiUrl}/categories`, { headers });
  }

  createLoanApplication(formData: FormData): Observable<any> {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.post(`${this.apiUrl}`, formData, { headers });
    }
}

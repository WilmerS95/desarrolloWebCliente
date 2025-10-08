import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoanApplication } from '../shared/models/LoanApplication';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoanAdminService {

  constructor(private http: HttpClient, private authService: AuthService) {}

    private get urlBase(): string {
      return this.authService.getBaseUrl() + '/loan-applications/admin';
    }

  getAll(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.urlBase}/all`);
  }

  accept(id: number): Observable<any> {
    return this.http.put(`${this.urlBase}/accept/${id}`, {});
  }

  reject(id: number, comment: string): Observable<any> {
    return this.http.put(`${this.urlBase}/reject/${id}`, { comment });
  }

  counterOffer(id: number, amount: number, comment: string): Observable<any> {
    return this.http.put(`${this.urlBase}/counter-offer/${id}`, {
      estimatedValue: amount,
      comment
    });
  }

  getOne(id: number): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.urlBase}/${id}`);
  }
}

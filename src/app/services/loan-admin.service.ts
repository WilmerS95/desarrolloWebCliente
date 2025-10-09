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
      return this.authService.getBaseUrl() + '/loan-applications';
    }

  getAll(): Observable<LoanApplication[]> {
    return this.http.get<LoanApplication[]>(`${this.urlBase}/admin/all`);
  }

  accept(id: number): Observable<any> {
    return this.http.put(`${this.urlBase}/admin/accept/${id}`, {});
  }

  getInstallmentProposal(id: number): Observable<any> {
    return this.http.get(`${this.urlBase}/client/installment-proposal/${id}`);
  }

  acceptInstallments(id: number): Observable<any> {
    return this.http.put(`${this.urlBase}/client/accept-installments/${id}`, {});
  }

  reject(id: number, comment: string): Observable<any> {
    return this.http.put(`${this.urlBase}/admin/reject/${id}`, { comment });
  }

  counterOffer(id: number, amount: number, comment: string): Observable<any> {
    return this.http.put(`${this.urlBase}/admin/counter-offer/${id}`, {
      estimatedValue: amount,
      comment
    });
  }

  getOne(id: number): Observable<LoanApplication> {
    return this.http.get<LoanApplication>(`${this.urlBase}/admin/${id}`);
  }
}

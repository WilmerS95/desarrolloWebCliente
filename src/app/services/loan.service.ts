import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

export interface LoanDTO {
  loanId: number;
  loanApplicationId: number;
  itemName: string;
  itemBrand: string;
  approvalDate: string;
  disbursementDate: string;
  loanAmount: number;
  interestRate: number;
  term: number;
  totalInterest: number;
  totalAmount: number;
  balance: number;
  status: string;
  contractNumber?: string;
  latePaymentFee?: number;
  gracePeriodDays?: number;
  defaultDays?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private get loanBase(): string {
    return this.authService.getBaseUrl() + '/loan-applications';
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.loanBase}/categories`,
      { headers: this.getHeaders() }
    );
  }

  createLoanApplication(formData: FormData): Observable<any> {
    return this.http.post(
      `${this.loanBase}`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  getMyActiveLoans(): Observable<LoanDTO[]> {
    return this.http.get<LoanDTO[]>(
      `${this.loanBase}/my-loans`,
      { headers: this.getHeaders() }
    );
  }

  getAllMyLoans(): Observable<LoanDTO[]> {
    return this.http.get<LoanDTO[]>(
      `${this.loanBase}/my-loans/all`,
      { headers: this.getHeaders() }
    );
  }

  getMyHistory(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.loanBase}/my-history`,
      { headers: this.getHeaders() }
    );
  }

  getMyContracts(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.loanBase}/my-history/contracts`,
      { headers: this.getHeaders() }
    );
  }
}

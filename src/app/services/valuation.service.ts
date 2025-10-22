import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

export interface ValuationRequest {
  loanApplicationId: number;
  estimatedValue: number;
  comments: string;
  term: number;
  interestRate: number;
}

export interface ValuationResponse {
  valuationId: number;
  loanApplicationId: number;
  estimatedValue: number;
  comments: string;
  valuationDate: string;
  appraiserId: number;
}

export interface LoanResponse {
  loanId: number;
  loanApplicationId: number;
  approvalDate: string;
  loanAmount: number;
  interestRate: number;
  term: number;
  dueDate: string;
  status: string;
  balance: number;
  monthlyPayment: number;
  totalToPay: number;
}

export interface PaymentPlanResponse {
  loanId: number;
  loanAmount: number;
  interestRate: number;
  term: number;
  monthlyPayment: number;
  totalInterest: number;
  totalToPay: number;
  installments: PaymentInstallment[];
}

export interface PaymentInstallment {
  installmentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  totalAmount: number;
  remainingBalance: number;
}

@Injectable({
  providedIn: 'root'
})
export class ValuationService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get urlBase(): string {
    return this.authService.getBaseUrl() + '/loan-applications';
  }

  createValuation(request: ValuationRequest): Observable<ValuationResponse> {
    return this.http.post<ValuationResponse>(this.urlBase, request);
  }

  getPaymentPlan(loanId: number): Observable<PaymentPlanResponse> {
    return this.http.get<PaymentPlanResponse>(`${this.urlBase}/payment-plan/${loanId}`);
  }

  getLoanByApplicationId(loanApplicationId: number): Observable<LoanResponse> {
    return this.http.get<LoanResponse>(`${this.urlBase}/loan/application/${loanApplicationId}`);
  }
}

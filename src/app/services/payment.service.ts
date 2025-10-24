import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

export interface PaymentRequestDTO {
  loanId: number;
  paymentNumber: number;
  amountPaid: number;
  paymentMethod: string;
  referenceBase64?: string;
}

export interface PaymentReviewDTO {
  paymentId: number;
  status: string;
  comment: string;
}

export interface PaymentDTO {
  paymentId: number;
  loanId: number;
  paymentNumber: number;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: string;
  status: string;
  reviewComment?: string;
  reviewDate?: string;
  reference?: any;
}

export interface PaymentScheduleDTO {
  scheduleId: number;
  paymentNumber: number;
  dueDate: string;
  amountDue: number;
  principalAmount: number;
  interestAmount: number;
  status: string;
  paidAmount?: number;
  paidDate?: string;
}

export interface AccountStatementDTO {
  loanId: number;
  loanAmount: number;
  totalInterest: number;
  totalAmount: number;
  balance: number;
  paidAmount: number;
  status: string;
  itemName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  totalPayments: number;
  paidPayments: number;
  paymentSchedule: PaymentScheduleDTO[];
  payments: PaymentDTO[];
}

export interface LoanDTO {
  loanId: number;
  itemName: string;
  loanAmount: number;
  totalAmount: number;
  balance: number;
  term: number;
  status: string;
  interestRate?: number;
  totalInterest?: number;
  approvalDate?: string;
  disbursementDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private get apiUrl(): string {
    return this.authService.getBaseUrl() + '/api/payments';
  }

  private get loanApiUrl(): string {
    return this.authService.getBaseUrl() + '/loan-applications';
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  reportPayment(request: PaymentRequestDTO): Observable<PaymentDTO> {
    return this.http.post<PaymentDTO>(
      `${this.apiUrl}/report`,
      request,
      { headers: this.getHeaders() }
    );
  }

  reviewPayment(review: PaymentReviewDTO): Observable<PaymentDTO> {
    return this.http.put<PaymentDTO>(
      `${this.apiUrl}/review`,
      review,
      { headers: this.getHeaders() }
    );
  }

  getPendingPayments(): Observable<PaymentDTO[]> {
    return this.http.get<PaymentDTO[]>(
      `${this.apiUrl}/pending`,
      { headers: this.getHeaders() }
    );
  }

  getLoanPayments(loanId: number): Observable<PaymentDTO[]> {
    return this.http.get<PaymentDTO[]>(
      `${this.apiUrl}/loan/${loanId}`,
      { headers: this.getHeaders() }
    );
  }

  getAccountStatement(loanId: number): Observable<AccountStatementDTO> {
    return this.http.get<AccountStatementDTO>(
      `${this.apiUrl}/statement/${loanId}`,
      { headers: this.getHeaders() }
    );
  }

  getMyActiveLoans(): Observable<LoanDTO[]> {
    return this.http.get<LoanDTO[]>(
      `${this.loanApiUrl}/my-loans`,
      { headers: this.getHeaders() }
    );
  }

  getMyLoansWithBalance(): Observable<LoanDTO[]> {
    return this.http.get<LoanDTO[]>(
      `${this.loanApiUrl}/my-loans/with-balance`,
      { headers: this.getHeaders() }
    );
  }

  getAllMyLoans(): Observable<LoanDTO[]> {
    return this.http.get<LoanDTO[]>(
      `${this.loanApiUrl}/my-loans/all`,
      { headers: this.getHeaders() }
    );
  }
}

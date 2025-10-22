import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  totalPayments: number;
  paidPayments: number;
  paymentSchedule: PaymentScheduleDTO[];
  payments: PaymentDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://192.168.1.39:8080/api/payments';

  constructor(private http: HttpClient) { }

  reportPayment(request: PaymentRequestDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/report`, request);
  }

  reviewPayment(review: PaymentReviewDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/review`, review);
  }

  getPendingPayments(): Observable<PaymentDTO[]> {
    return this.http.get<PaymentDTO[]>(`${this.apiUrl}/pending`);
  }

  getLoanPayments(loanId: number): Observable<PaymentDTO[]> {
    return this.http.get<PaymentDTO[]>(`${this.apiUrl}/loan/${loanId}`);
  }

  getAccountStatement(loanId: number): Observable<AccountStatementDTO> {
    return this.http.get<AccountStatementDTO>(`${this.apiUrl}/statement/${loanId}`);
  }
}

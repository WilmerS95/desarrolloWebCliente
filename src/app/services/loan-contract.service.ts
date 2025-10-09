import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

export interface LoanContract {
  loanId: number;
  loanApplicationId: number;
  itemName: string;
  itemBrand?: string;
  approvalDate: string;
  loanAmount: number;
  interestRate: number;
  term: number;
  dueDate: string;
  status: string;
  balance: number;
  contractNumber?: string;
  contractSignatureHash?: string;
  latePaymentFee?: number;
  gracePeriodDays?: number;
  installments?: InstallmentDetail[];
}

export interface InstallmentDetail {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoanContractService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get urlBase(): string {
    return this.authService.getBaseUrl() + '/loan-applications';
  }

  getMyContracts(): Observable<LoanContract[]> {
    return this.http.get<LoanContract[]>(`${this.urlBase}/my-contracts`);
  }

  getContractDetails(loanApplicationId: number): Observable<LoanContract> {
    return this.http.get<LoanContract>(`${this.urlBase}/my-history/${loanApplicationId}/contract`);
  }

  getContractHtml(loanApplicationId: number): Observable<string> {
    return this.http.get(
      `${this.urlBase}/my-history/${loanApplicationId}/contract-html`,
      { responseType: 'text' }
    );
  }

  openContractInNewWindow(loanApplicationId: number): void {
    this.getContractHtml(loanApplicationId).subscribe({
      next: (html) => {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(html);
          newWindow.document.close();
        }
      },
      error: (error) => {
        console.error('Error abriendo contrato:', error);
        alert('No se pudo abrir el contrato');
      }
    });
  }
}

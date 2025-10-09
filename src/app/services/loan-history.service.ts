// src/app/services/loan-history.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

export interface LoanHistory {
  loanApplicationId: number;
  itemId: number;
  itemName: string;
  brand: string;
  quantityPayments: number;
  requestedAmount: number;
  applicationDate: string;
  status: string;
  photoUrls: string[];
}

@Injectable({
  providedIn: 'root'
})
export class LoanHistoryService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get urlBase(): string {
    return this.authService.getBaseUrl() + '/loan-applications';
  }

  getMyHistory(): Observable<LoanHistory[]> {
    return this.http.get<LoanHistory[]>(`${this.urlBase}/my-history`);
  }

  getMyApplication(id: number): Observable<LoanHistory> {
    return this.http.get<LoanHistory>(`${this.urlBase}/my-history/${id}`);
  }
}

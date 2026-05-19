import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

export interface ItemTransfer {
  itemId: number;
  loanId?: number;
  salePrice: number;
  reason: string;
  adminComment?: string;
  transferredBy?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private get apiUrl(): string {
    return `${this.authService.getBaseUrl()}/store`;
  }

  getAvailableItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/items`, { headers: this.getAuthHeaders() });
  }

  transferItemToStore(transfer: ItemTransfer): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, transfer, { headers: this.getAuthHeaders() });
  }

  transferOverdueLoans(): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer/overdue`, {}, { headers: this.getAuthHeaders() });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}

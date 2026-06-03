import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { Card } from '../shared/models/card';
import { Fine } from '../shared/models/fine';

@Injectable({
  providedIn: 'root'
})
export class DisciplineService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private base(tournamentId: number) {
    return `${this.auth.getBaseUrl()}/api/competitions/tournaments/${tournamentId}/discipline`;
  }

  getCards(tournamentId: number): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.base(tournamentId)}/cards`);
  }

  addCard(tournamentId: number, payload: Partial<Card>): Observable<Card> {
    return this.http.post<Card>(`${this.base(tournamentId)}/cards`, payload);
  }

  getFines(tournamentId: number): Observable<Fine[]> {
    return this.http.get<Fine[]>(`${this.base(tournamentId)}/fines`);
  }

  createFine(tournamentId: number, payload: Partial<Fine>): Observable<Fine> {
    return this.http.post<Fine>(`${this.base(tournamentId)}/fines`, payload);
  }

  payFine(tournamentId: number, fineId: number): Observable<any> {
    return this.http.post(`${this.base(tournamentId)}/fines/${fineId}/pay`, {});
  }
}

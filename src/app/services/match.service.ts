import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { Match } from '../shared/models/match';


@Injectable({
  providedIn: 'root'
})
export class MatchService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private base(tournamentId: number) {
    return `${this.auth.getBaseUrl()}/api/competitions/tournaments/${tournamentId}/matches`;
  }

  getMatches(tournamentId: number): Observable<Match[]> {
    return this.http.get<Match[]>(this.base(tournamentId));
  }

  getMatch(tournamentId: number, matchId: number): Observable<Match> {
    return this.http.get<Match>(`${this.base(tournamentId)}/${matchId}`);
  }

  createMatch(tournamentId: number, payload: Partial<Match>): Observable<Match> {
    return this.http.post<Match>(this.base(tournamentId), payload);
  }

  updateMatch(tournamentId: number, matchId: number, payload: Partial<Match>): Observable<Match> {
    return this.http.put<Match>(`${this.base(tournamentId)}/${matchId}`, payload);
  }

  deleteMatch(tournamentId: number, matchId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(tournamentId)}/${matchId}`);
  }
}

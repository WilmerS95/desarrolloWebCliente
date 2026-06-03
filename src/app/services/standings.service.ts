import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { Standing } from '../shared/models/standing';

@Injectable({
  providedIn: 'root'
})
export class StandingsService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private base(tournamentId: number) {
    return `${this.auth.getBaseUrl()}/api/competitions/tournaments/${tournamentId}/standings`;
  }

  getGroupStandings(tournamentId: number): Observable<Standing[]> {
    return this.http.get<Standing[]>(`${this.base(tournamentId)}/groups`);
  }

  getKnockoutStandings(tournamentId: number): Observable<any> {
    return this.http.get<any>(`${this.base(tournamentId)}/knockout`);
  }

  recalculate(tournamentId: number): Observable<Standing[]> {
    return this.http.post<Standing[]>(`${this.base(tournamentId)}/recalculate`, {});
  }
}

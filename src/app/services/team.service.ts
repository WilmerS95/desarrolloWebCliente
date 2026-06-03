import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { Team } from '../shared/models/team';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private base(tournamentId: number) {
    return `${this.auth.getBaseUrl()}/api/competitions/tournaments/${tournamentId}/teams`;
  }

  getTeams(tournamentId: number): Observable<Team[]> {
    return this.http.get<Team[]>(this.base(tournamentId));
  }

  getTeam(tournamentId: number, teamId: number): Observable<Team> {
    return this.http.get<Team>(`${this.base(tournamentId)}/${teamId}`);
  }

  createTeam(tournamentId: number, payload: Partial<Team>): Observable<Team> {
    return this.http.post<Team>(this.base(tournamentId), payload);
  }

  updateTeam(tournamentId: number, teamId: number, payload: Partial<Team>): Observable<Team> {
    return this.http.put<Team>(`${this.base(tournamentId)}/${teamId}`, payload);
  }

  deleteTeam(tournamentId: number, teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(tournamentId)}/${teamId}`);
  }
}

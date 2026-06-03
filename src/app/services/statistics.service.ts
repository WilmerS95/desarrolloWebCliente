import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { PlayerStatistic } from '../shared/models/player-statistic';


@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private base(tournamentId: number) {
    return `${this.auth.getBaseUrl()}/api/competitions/tournaments/${tournamentId}/statistics`;
  }

  getTopScorers(tournamentId: number, limit: number = 10): Observable<PlayerStatistic[]> {
    return this.http.get<PlayerStatistic[]>(`${this.base(tournamentId)}/top-scorers?limit=${limit}`);
  }

  getLeastConceded(tournamentId: number, limit: number = 10): Observable<PlayerStatistic[]> {
    return this.http.get<PlayerStatistic[]>(`${this.base(tournamentId)}/least-conceded?limit=${limit}`);
  }

  getPlayerStatistics(tournamentId: number, playerId: number): Observable<PlayerStatistic> {
    return this.http.get<PlayerStatistic>(`${this.base(tournamentId)}/players/${playerId}`);
  }

  getTeamStatistics(tournamentId: number, teamId: number): Observable<any> {
    return this.http.get<any>(`${this.base(tournamentId)}/teams/${teamId}`);
  }
}

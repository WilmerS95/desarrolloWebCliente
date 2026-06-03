import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { Player } from '../shared/models/player';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private base(teamId: number) {
    return `${this.auth.getBaseUrl()}/api/competitions/teams/${teamId}/players`;
  }

  getPlayers(teamId: number): Observable<Player[]> {
    return this.http.get<Player[]>(this.base(teamId));
  }

  getPlayer(teamId: number, playerId: number): Observable<Player> {
    return this.http.get<Player>(`${this.base(teamId)}/${playerId}`);
  }

  createPlayer(teamId: number, payload: Partial<Player>): Observable<Player> {
    return this.http.post<Player>(this.base(teamId), payload);
  }

  updatePlayer(teamId: number, playerId: number, payload: Partial<Player>): Observable<Player> {
    return this.http.put<Player>(`${this.base(teamId)}/${playerId}`, payload);
  }

  deletePlayer(teamId: number, playerId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(teamId)}/${playerId}`);
  }
}

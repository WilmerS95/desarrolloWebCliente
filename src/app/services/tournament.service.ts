import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { Tournament } from '../shared/models/tournament';

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private base() {
    return `${this.auth.getBaseUrl()}/api/competitions/public/tournaments`;
  }

  getAll(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.base());
  }

  getById(id: number): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.base()}/${id}`);
  }

  create(payload: Partial<Tournament>): Observable<Tournament> {
    return this.http.post<Tournament>(this.base(), payload);
  }

  update(id: number, payload: Partial<Tournament>): Observable<Tournament> {
    return this.http.put<Tournament>(`${this.base()}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base()}/${id}`);
  }
}

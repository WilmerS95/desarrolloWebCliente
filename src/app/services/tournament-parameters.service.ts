import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TournamentParameter } from '../shared/models/TournamentParameter';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TournamentParameterService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private get urlBase(): string {
    return this.authService.getBaseUrl() + '/tournament-parameters/api/parameters';
  }

  getAll(): Observable<TournamentParameter[]> {
    return this.http.get<TournamentParameter[]>(this.urlBase);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.urlBase}/categories`);
  }

  getByCategory(category: string): Observable<TournamentParameter[]> {
    return this.http.get<TournamentParameter[]>(`${this.urlBase}/category/${category}`);
  }

  getById(id: number): Observable<TournamentParameter> {
    return this.http.get<TournamentParameter>(`${this.urlBase}/${id}`);
  }

  getValue(name: string): Observable<{ name: string; value: string }> {
    return this.http.get<{ name: string; value: string }>(`${this.urlBase}/${name}/value`);
  }

  getHistory(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBase}/${id}/history`);
  }

  getRecentChanges(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlBase}/history/recent`);
  }

  update(id: number, value: string, reason?: string): Observable<TournamentParameter> {
    return this.http.put<TournamentParameter>(`${this.urlBase}/${id}`, { value, reason });
  }

  create(parameter: TournamentParameter): Observable<TournamentParameter> {
    return this.http.post<TournamentParameter>(this.urlBase, parameter);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlBase}/${id}`);
  }
}

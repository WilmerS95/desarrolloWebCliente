import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { MatchDocument } from '../shared/models/match-document';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private base(tournamentId: number) {
    return `${this.auth.getBaseUrl()}/api/competitions/tournaments/${tournamentId}/documents`;
  }

  uploadMatchDocument(tournamentId: number, matchId: number, file: File): Observable<HttpEvent<any>> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('matchId', String(matchId));
    return this.http.post<any>(`${this.base(tournamentId)}/upload`, fd, { reportProgress: true, observe: 'events' });
  }

  getDocuments(tournamentId: number): Observable<MatchDocument[]> {
    return this.http.get<MatchDocument[]>(this.base(tournamentId));
  }

  getMatchDocuments(tournamentId: number, matchId: number): Observable<MatchDocument[]> {
    return this.http.get<MatchDocument[]>(`${this.base(tournamentId)}/match/${matchId}`);
  }

  deleteDocument(tournamentId: number, documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(tournamentId)}/${documentId}`);
  }
}

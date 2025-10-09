import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BusinessParameter } from '../shared/models/BusinessParameter';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BusinessParameterService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private get urlBase(): string {
    return this.authService.getBaseUrl() + '/business-parameters/api/parameters';
  }

  getAll(): Observable<BusinessParameter[]> {
    return this.http.get<BusinessParameter[]>(this.urlBase);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.urlBase}/categories`);
  }

  getByCategory(category: string): Observable<BusinessParameter[]> {
    return this.http.get<BusinessParameter[]>(`${this.urlBase}/category/${category}`);
  }

  getById(id: number): Observable<BusinessParameter> {
    return this.http.get<BusinessParameter>(`${this.urlBase}/${id}`);
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

  update(id: number, value: string, reason?: string): Observable<BusinessParameter> {
    return this.http.put<BusinessParameter>(`${this.urlBase}/${id}`, { value, reason });
  }

  create(parameter: BusinessParameter): Observable<BusinessParameter> {
    return this.http.post<BusinessParameter>(this.urlBase, parameter);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.urlBase}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role } from '../shared/models/Role';
import { AppRolePermission } from '../shared/models/AppRolePermission';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get loanBase(): string {
    return this.authService.getBaseUrl() + '/admin/users/roles';
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.loanBase);
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.loanBase}/${id}`);
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.loanBase, role);
  }

  updateRole(id: number, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.loanBase}/${id}`, role);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.loanBase}/${id}`);
  }
}

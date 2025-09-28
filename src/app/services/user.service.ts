import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { User } from '../shared/models/user';
import { Role } from '../shared/models/Role';
import { RegisterRequest } from '../shared/models/register-request';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get urlBase(): string {
    return this.authService.getBaseUrl() + '/admin/users';
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.urlBase);
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.urlBase}/roles`);
  }

  updateUserRole(userId: number, roleId: number): Observable<User> {
    return this.http.patch<User>(`${this.urlBase}/${userId}/role?roleId=${roleId}`, {});
  }

  updateUser(user: User) {
    return this.http.put<User>(`${this.urlBase}/${user.userID}`, user);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.urlBase}/${userId}`);
  }

  createUser(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.authService.getBaseUrl()}/auth/register`, data);
  }
}

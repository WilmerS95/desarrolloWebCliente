import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppRolePermission } from '../shared/models/AppRolePermission';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get permissionBase(): string {
    return this.authService.getBaseUrl() + '/admin/users/permissions';
  }

  getAllPermissions(): Observable<AppRolePermission[]> {
    return this.http.get<AppRolePermission[]>(this.permissionBase);
  }
}

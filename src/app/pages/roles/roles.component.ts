import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Role } from '../../shared/models/Role';
import { AppRolePermission } from '../../shared/models/AppRolePermission';
import { RoleService } from '../../services/role.service';
import { PermissionService } from '../../services/permission.service';
import { RoleRequest } from '../../shared/models/RoleRequest';

@Component({
  selector: 'app-roles',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  allPermissions: AppRolePermission[] = [];
  expandedRoleId: number | null = null;
  roleForm: FormGroup;
  editingRole: Role | null = null;
  showForm = false;

  selectedRole: Role | null = null;

  constructor(
    private roleService: RoleService,
    private permissionService: PermissionService,
    private fb: FormBuilder
  ) {
    this.roleForm = this.fb.group({
      roleName: ['', Validators.required],
      description: [''],
      permissions: [[]]
    });
  }

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe((data: Role[]) => {
      this.roles = data;
    });
  }

  loadPermissions(): void {
    this.permissionService.getAllPermissions().subscribe((data: AppRolePermission[]) => {
      this.allPermissions = data;
    });
  }

  togglePermissions(roleId: number): void {
    this.expandedRoleId = this.expandedRoleId === roleId ? null : roleId;
  }

  startCreate(): void {
    this.editingRole = null;
    this.roleForm.reset({ roleName: '', description: '', permissions: [] });
    this.showForm = true;
  }

  startEdit(role: Role): void {
    this.editingRole = role;
    const selectedPermissionIds = role.permissions?.map(p => p.permissionId) || [];
    this.roleForm.patchValue({
      roleName: role.roleName,
      description: role.description || '',
      permissions: selectedPermissionIds
    });
    this.showForm = true;
  }

  saveRole(): void {
    const formValue = this.roleForm.value;
    const selectedPermissions: AppRolePermission[] =
      this.allPermissions.filter(p => formValue.permissions.includes(p.permissionId));

    const roleData: Role = {
      roleId: this.editingRole ? this.editingRole.roleId : 0,
      roleName: formValue.roleName,
      description: formValue.description,
      permissions: selectedPermissions// ?? []
    };

    const request : RoleRequest = {
      roleName: roleData.roleName,
      description: roleData.description,
      permissionIds: formValue.permissions ?? []
    };

    if (this.editingRole) {
      this.roleService.updateRole(this.editingRole.roleId, request).subscribe(() => {
        this.loadRoles();
        this.showForm = false;
      });
    } else {
      this.roleService.createRole(request).subscribe(() => {
        this.loadRoles();
        this.showForm = false;
      });
    }
  }

  deleteRole(id: number): void {
    if (confirm('¿Seguro que quieres eliminar este rol?')) {
      this.roleService.deleteRole(id).subscribe(() => this.loadRoles());
    }
  }

  getPermissionNames(role: Role): string {
    return role.permissions?.map(p => p.permissionName).join(', ') || '(sin permisos)';
  }

  isPermissionSelected(permissionId: number): boolean {
    return this.roleForm.value.permissions.includes(permissionId);
  }

  onPermissionChange(event: any, permissionId: number): void {
    const selected = this.roleForm.value.permissions as number[];
    if (event.target.checked) {
      this.roleForm.patchValue({ permissions: [...selected, permissionId] });
    } else {
      this.roleForm.patchValue({ permissions: selected.filter(id => id !== permissionId) });
    }
  }
}

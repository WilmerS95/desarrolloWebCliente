import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Role } from '../../shared/models/Role';
import { AppRolePermission } from '../../shared/models/AppRolePermission';
import { RoleService } from '../../services/role.service';
import { PermissionService } from '../../services/permission.service';
import { RoleRequest } from '../../shared/models/RoleRequest';
import Swal from 'sweetalert2';

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
    this.roleService.getRoles().subscribe({
      next: (data: Role[]) => (this.roles = data),
      error: () => this.showError('Error al cargar roles')
    });
  }

  loadPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: (data: AppRolePermission[]) => (this.allPermissions = data),
      error: () => this.showError('Error al cargar permisos')
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
    const request: RoleRequest = {
      roleName: formValue.roleName,
      description: formValue.description,
      permissionIds: formValue.permissions ?? []
    };

    if (this.editingRole) {
      this.roleService.updateRole(this.editingRole.roleId, request).subscribe({
        next: () => {
          this.showSuccess('Rol actualizado correctamente');
          this.loadRoles();
          this.showForm = false;
        },
        error: () => this.showError('Error al actualizar el rol')
      });
    } else {
      this.roleService.createRole(request).subscribe({
        next: () => {
          this.showSuccess('Rol creado correctamente');
          this.loadRoles();
          this.showForm = false;
        },
        error: () => this.showError('Error al crear el rol')
      });
    }
  }

  deleteRole(id: number): void {
    Swal.fire({
      title: '¿Seguro que quieres eliminar este rol?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.roleService.deleteRole(id).subscribe({
          next: () => {
            this.showSuccess('Rol eliminado correctamente');
            this.loadRoles();
          },
          error: () => this.showError('Error al eliminar el rol')
        });
      }
    });
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
  private showSuccess(message: string) {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: message,
      timer: 1500,
      showConfirmButton: false
    });
  }
  private showError(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }
}

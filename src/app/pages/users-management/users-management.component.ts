import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../shared/models/user';
import { Role } from '../../shared/models/Role';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users-management',
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  userForm: FormGroup;
  editingUser: User | null = null;
  showForm = false;

  constructor(private userService: UserService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      secondOrMoreNames: [''],
      firstLastName: ['', Validators.required],
      secondLastName: [''],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      address: [''],
      roleID: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.userService.getAllRoles().subscribe({
      next: roles => {
        this.roles = roles;
        this.loadUsers();
      },
      error: err => console.error(err)
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: res => {
        this.users = res.map(u => ({
          ...u,
          roleID: this.roles.find(r => r.roleName === u.roleName)?.roleId ?? null
        }));
      },
      error: err => console.error(err)
    });
  }

  loadRoles() {
    this.userService.getAllRoles().subscribe({
      next: (res) => (this.roles = res),
      error: (err) => console.error(err)
    });
  }

  getRoleName(roleId: number | null): string {
    if (roleId == null) return 'Sin rol';
    const role = this.roles.find(r => r.roleId === roleId);
    return role ? role.roleName : 'Sin rol';
  }

  startEdit(user: User) {
    this.editingUser = user;
    this.userForm.patchValue(user);
    this.showForm = true;
  }

  cancelEdit() {
    this.showForm = false;
    this.editingUser = null;
  }

  saveUser() {
    if (!this.editingUser) return;

    const formValue = this.userForm.value;

    const updated: any = {
      ...this.editingUser,
      ...formValue,
      role: { roleId: formValue.roleID }
    };

    delete updated.roleID;

    this.userService.updateUser(updated).subscribe({
      next: () => {
        this.loadUsers();
        this.showSuccess('Usuario actualizado correctamente');
        this.showForm = false;
        this.editingUser = null;
      },
      error: () => this.showError('Error al actualizar el usuario')
    });
  }

  deleteUser(user: User) {
    const fullName = `${user.firstName} ${user.secondOrMoreNames || ''} ${user.firstLastName} ${user.secondLastName || ''}`;
    Swal.fire({
      title: `¿Eliminar usuario ${fullName.trim()}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.userID).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.userID !== user.userID);
            this.showSuccess('Usuario eliminado');
          },
          error: () => this.showError('Error al eliminar usuario')
        });
      }
    });
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

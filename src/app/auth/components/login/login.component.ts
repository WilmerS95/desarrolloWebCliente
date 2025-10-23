import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
    ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = null;

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Bienvenido',
          text: 'Inicio de sesión exitoso',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        }).then(() => {
          this.router.navigate(['/store']).then(() => {
            window.location.reload();
          });
        });
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status === 401 || (err.error?.message === 'Usuario o contraseña incorrectos')) {
          Swal.fire({
            icon: 'error',
            title: 'Credenciales inválidas',
            text: 'El usuario o la contraseña son incorrectos'
          });
        } else {
          // Cualquier otro error
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error inesperado. Intente nuevamente más tarde.'
          });
        }
      }
      /* error: () => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Usuario o contraseña incorrectos'
        });
      } */
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}

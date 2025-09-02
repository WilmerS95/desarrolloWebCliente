import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

  constructor(private fb: FormBuilder/*, private authService: AuthService*/) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = null;
  }

  loginWithGoogle() {
    Swal.fire({
      icon: 'info',
      title: 'Login con Google',
      text: 'Funcionalidad de login con Google aún no disponible.',
      confirmButtonText: 'Entendido'
    });
  }

  loginWithFacebook() {
    Swal.fire({
      icon: 'info',
      title: 'Login con Facebook',
      text: 'Funcionalidad de login con Facebook aún no disponible.',
      confirmButtonText: 'Vale'
    });
  }
}

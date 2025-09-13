import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.forgotForm = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
        });
  }

  onSubmit() {
      if (this.forgotForm.valid) {
        const email = this.forgotForm.value.email;

        this.authService.forgotPassword(email).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Correo enviado',
              text: 'Revisa tu bandeja de entrada para restablecer tu contraseña',
            });
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.error || 'No se pudo enviar el correo de recuperación',
            });
          }
        });
      }
    }
}

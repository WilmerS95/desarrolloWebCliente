import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.resetForm.valid) {
      const newPassword = this.resetForm.value.password;

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: 'Ya puedes iniciar sesión con tu nueva contraseña',
          }).then(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (err) => {
          console.error(err);
          const message =
              err?.error?.message || // si tu backend envía { "message": "..." }
              err?.error ||          // si envía texto plano
              'No se pudo restablecer la contraseña';

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
          });
        }
      });
    }
  }
}

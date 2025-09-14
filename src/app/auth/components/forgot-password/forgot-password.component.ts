import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  readonlyEmail: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.forgotForm = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
        });

    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.forgotForm.patchValue({ email: params['email'] });
        this.readonlyEmail = true;
      }
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
            let errorMsg = 'No se pudo enviar el correo de recuperación';
            if (err?.error) {
                if (typeof err.error === 'string') {
                  errorMsg = err.error;
                }
                else if (err.error.message) {
                  errorMsg = err.error.message;
                }
                else {
                  errorMsg = JSON.stringify(err.error);
                }
              }

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMsg
            });
          }
        });
      }
    }
}

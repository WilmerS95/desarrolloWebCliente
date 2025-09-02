import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error = null;
    const { email, password } = this.loginForm.value;
    /* this.authService.login(email, password).subscribe({
      next: () => { this.loading = false;  *//* redirigir *//*  },
      error: (err: any) => { this.error = err; this.loading = false; }
    }); */
  }

  loginWithGoogle() {
    window.alert('Funcionalidad de login con Google aún no disponible.');
    //this.authService.loginWithGoogle();
  }

  loginWithFacebook() {
    window.alert('Funcionalidad de login con Facebook aún no disponible.');
    //this.authService.loginWithFacebook();
  }
}

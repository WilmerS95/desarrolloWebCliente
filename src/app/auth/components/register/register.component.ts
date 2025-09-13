import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../../shared/models/register-request';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
    ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      firstName: ['', Validators.required],
      secondOrMoreNames: [''],
      firstLastName: ['', Validators.required],
      secondLastName: [''],
      marriedLastName: [''],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      address: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
          this.registerForm.markAllAsTouched();
          return;
    }

    const form = this.registerForm.value;

    const { name, email, password } = this.registerForm.value;

    const payload: RegisterRequest = {
          username: form.username,
          password: form.password,
          firstName: form.firstName,
          secondOrMoreNames: form.secondOrMoreNames || '',
          firstLastName: form.firstLastName,
          secondLastName: form.secondLastName || '',
          marriedLastName: form.marriedLastName || '',
          email: form.email,
          telephone: form.telephone || '',
          address: form.address || ''
        };

    this.authService.register(payload).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Registrado', text: 'Cuenta creada correctamente' });
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: err?.error || 'No se pudo registrar' });
          }
        });
  }
}

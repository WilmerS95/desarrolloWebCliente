import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxIntlTelInputModule, SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../../shared/models/register-request';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgxIntlTelInputModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    PhoneNumberFormat = PhoneNumberFormat;

  preferredCountries: CountryISO[] = [CountryISO.Guatemala, CountryISO.Mexico, CountryISO.UnitedStates];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
    ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [
              Validators.required,
              Validators.minLength(5),
              Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).+$/)
      ]],
      firstName: ['', Validators.required],
      secondOrMoreNames: [''],
      firstLastName: ['', Validators.required],
      secondLastName: [''],
      marriedLastName: [''],
      email: ['', [Validators.required, Validators.email]],
      telephone: [ { number: '', internationalNumber: '', nationalNumber: '', e164Number: '', countryCode: CountryISO.Guatemala } ],
      address: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {

      const formValue = { ...this.registerForm.value };

      let telephoneStr = '';
          if (formValue.telephone) {
            if (typeof formValue.telephone === 'string') {
              telephoneStr = formValue.telephone;
            } else if (formValue.telephone.e164Number) {
              telephoneStr = formValue.telephone.e164Number;
            }
          }


      const payload: RegisterRequest = {
            username: formValue.username,
            password: formValue.password,
            firstName: formValue.firstName,
            secondOrMoreNames: formValue.secondOrMoreNames || '',
            firstLastName: formValue.firstLastName,
            secondLastName: formValue.secondLastName || '',
            marriedLastName: formValue.marriedLastName || '',
            email: formValue.email,
            telephone: telephoneStr,
            address: formValue.address || ''
          };

         this.authService.register(payload).subscribe({
           next: () => {
             Swal.fire({ icon: 'success', title: 'Registrado', text: 'Cuenta creada correctamente' });
             this.router.navigate(['/login']);
           },
           error: (err) => {
             let errorMsg = 'No se pudo registrar';
             const errorField = err?.error?.field;
             const errorMessage = err?.error?.message;

               if (errorMessage) {
                 errorMsg = errorMessage;
               } else if (typeof err.error === 'string') {
                 errorMsg = err.error;
               }

              if (errorField === 'email') {
                Swal.fire({
                  icon: 'error',
                  title: 'Correo ya registrado',
                  text: errorMsg,
                  showCancelButton: true,
                  confirmButtonText: 'Recuperar contraseña',
                  cancelButtonText: 'Cancelar'
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.router.navigate(['/forgot-password'], {
                      queryParams: { email: formValue.email }
                    });
                  }
                });
              } else {
                console.error(err);
                Swal.fire({ icon: 'error', title: 'Error', text: errorMsg });
                }
           }
         });
      }
  }
}

import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'desarrollo-web';
  currentYear = new Date().getFullYear();

  constructor(
      private router: Router,
      private authService: AuthService
  ) {}


  showPrivacyPolicy(event: Event) {
    event.preventDefault();
    Swal.fire({
      title: 'Política de Privacidad',
      html: `
        <p>Nos tomamos muy en serio tu privacidad.
        Tus datos serán tratados de acuerdo a la normativa vigente y
        nunca serán compartidos sin tu consentimiento.</p>
      `,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }

  showTerms(event: Event) {
    event.preventDefault();
    Swal.fire({
      title: 'Términos y Condiciones',
      html: `
        <p>Al usar esta aplicación aceptas los términos y condiciones de uso.
        Nos reservamos el derecho de actualizar estos términos en cualquier momento.</p>
      `,
      icon: 'info',
      confirmButtonText: 'Aceptar'
    });
  }

  goToStore() {
      this.router.navigate(['/store']);
  }

  goToPawn() {
      if (this.isLoggedIn()) {
        this.router.navigate(['/loan-application']);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: '¡Bienvenido!',
          text: 'Aquí puedes realizar la solicitud de empeño.',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          customClass: {
            popup: 'toast-info'
          }
        });
        return;
      }

      Swal.fire({
            icon: 'info',
            title: 'Funcionalidad de empeño',
            text: 'Debes iniciar sesión para empeñar un artículo',
            confirmButtonText: 'Aceptar'
          }).then(() => this.goToLogin());
      //this.goToLogin()
      /* if (this.isLoggedIn()) {
        this.router.navigate(['/pawn']);
      } else {
        goToLogin()
      } */
    }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  logout() {
    Swal.fire({
      icon: 'warning',
      title: 'Cerrar sesión',
      text: '¿Estás seguro que quieres cerrar sesión?',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/store']);
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'desarrollo-web';
  currentYear = new Date().getFullYear();

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
}

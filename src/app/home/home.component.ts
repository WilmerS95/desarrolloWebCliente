import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // Puedes inicializar variables si luego quieres usar [(ngModel)]
  nombre: string = '';
  apellido: string = '';
  cedula: string = '';
  monto: number | null = null;
  plazo: number | null = null;

  enviarSolicitud() {
    console.log('Solicitud enviada:', {
      nombre: this.nombre,
      apellido: this.apellido,
      cedula: this.cedula,
      monto: this.monto,
      plazo: this.plazo
    });
    alert('Solicitud enviada (solo visual por ahora)');
  }
}


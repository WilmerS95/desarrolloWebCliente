import { Component } from '@angular/core';
import { SolicitudPrestamoComponent } from './solicitud-prestamo/solicitud-prestamo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SolicitudPrestamoComponent], // <- aquí se importa
  template: `<app-solicitud-prestamo></app-solicitud-prestamo>`,
})
export class AppComponent {}


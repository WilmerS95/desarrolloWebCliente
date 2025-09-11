import { Routes } from '@angular/router';
import { SolicitudPrestamoComponent } from './solicitud-prestamo/solicitud-prestamo.component';

export const routes: Routes = [
  { path: '', redirectTo: 'solicitud-prestamo', pathMatch: 'full' }, // redirige al inicio
  { path: 'solicitud-prestamo', component: SolicitudPrestamoComponent }
];


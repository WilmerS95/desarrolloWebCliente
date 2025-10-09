import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const parameterAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const hasPermission = authService.hasPermission('MANAGE_PARAMETERS') ||
                        authService.isAdmin();

  if (!hasPermission) {
    Swal.fire({
      icon: 'error',
      title: 'Acceso Denegado',
      text: 'No tienes permisos para acceder a esta sección',
      confirmButtonText: 'Entendido'
    });
    router.navigate(['/']);
    return false;
  }

  return true;
};

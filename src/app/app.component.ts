import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth/services/auth.service';
import { CartService } from './services/cart.service';
import { CartItem } from './shared/models/CartItem';
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
  currentUser: any = null;
  dropdownOpen = false;
  cartCount = 0;

  constructor(
      private router: Router,
      private authService: AuthService,
      private cartService: CartService
  ) {}

  ngOnInit() {
    this.cartService.cartCount$.subscribe(count => { this.cartCount = count });
    //this.updateCart();
    if (this.isLoggedIn()) {
      this.currentUser = {
        name: this.authService.getUserName(),
        role: this.authService.getUserRole()
      };
    }
    const exp = localStorage.getItem('token_exp');
    if (exp) {
      this.authService['scheduleTokenCheck'](parseInt(exp, 10));
    }
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  addToCart(item: CartItem) {
    this.cartService.addItem(item);
    this.updateCart();
  }

  updateCart() {
    this.cartCount = this.cartService.getCount();
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  /* get isSuperAdmin(): boolean {
    return this.currentUser?.role === 'SUPER_ADMIN';
  } */

  can(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

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

  goToHistory() {
    this.router.navigate(['/history']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRoles(){
    this.router.navigate(['/roles']);
  }

  goToAdminUsers(){
    this.router.navigate(['/admin-users']);
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  goToRegister(){
    this.router.navigate(['/register']);
  }

  goToPawnRequests(){
    this.router.navigate(['/admin/solicitudes']);
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

  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.user-dropdown');

    if (dropdown && !dropdown.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }
}

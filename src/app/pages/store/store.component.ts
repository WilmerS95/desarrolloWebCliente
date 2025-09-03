import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-store',
  imports: [],
  templateUrl: './store.component.html',
  styleUrl: './store.component.css'
})
export class StoreComponent {
constructor(private router: Router) {}

  /* isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  } */

  goToPawn() {
    this.goToLogin()
    /* if (this.isLoggedIn()) {
      this.router.navigate(['/pawn']);
    } else {
      goToLogin()
    } */
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

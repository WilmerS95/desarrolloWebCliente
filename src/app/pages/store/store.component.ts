import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Item } from '../../shared/models/item';
import { Category } from '../../shared/models/category';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './store.component.html',
  styleUrl: './store.component.css'
})
export class StoreComponent {
  currentYear = new Date().getFullYear();

  // Categorías de prueba
  categories: Category[] = [
    { categoryId: 1, categoryName: 'Electrónica', description: 'Dispositivos electrónicos' },
    { categoryId: 2, categoryName: 'Joyería', description: 'Collares, anillos y más' }
  ];

items: Item[] = [
    { itemID: 1, categoryId: 1, nameItem: 'Laptop Gamer', brand: 'Asus', photos: '/assets/products/Laptop.jpg', description: 'Laptop potente para gaming', price: 4500 },
    { itemID: 2, categoryId: 1, nameItem: 'Reloj Inteligente', brand: 'Apple', photos: '/assets/products/Laptop.jpg', description: 'Smartwatch de última generación', price: 2500 },
    { itemID: 3, categoryId: 2, nameItem: 'Pulsera', brand: 'Pandora', photos: '/assets/products/Laptop.jpg', description: 'Pulsera elegante', price: 800 },
    { itemID: 4, categoryId: 2, nameItem: 'Collar', brand: 'Swarovski', photos: '/assets/products/Laptop.jpg', description: 'Collar de lujo', price: 1200 },
    { itemID: 5, categoryId: 1, nameItem: 'Televisor LED', brand: 'Samsung', photos: '/assets/products/Laptop.jpg', description: 'TV 4K 55 pulgadas', price: 5500 },
    { itemID: 6, categoryId: 2, nameItem: 'Anillo', brand: 'Cartier', photos: '/assets/products/Laptop.jpg', description: 'Anillo de oro', price: 4000 }
  ];

  constructor(private router: Router) {}

  /* isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  } */

  goToPawn() {
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

  addToCart(item: Item) {
    Swal.fire({
      icon: 'success',
      title: 'Artículo agregado',
      text: `${item.nameItem} se ha agregado al carrito`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  formatCurrency(amount?: number): string {
    if (amount == null) return ''; // si es undefined o null
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    .format(amount)
    .replace('GTQ', 'Q.');
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';
import Swal from 'sweetalert2';
import { Item } from '../../shared/models/item';
import { Category } from '../../shared/models/category';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent {
  currentYear = new Date().getFullYear();

  searchTerm: string = '';
  selectedCategory: string | number = 'all';
  filteredItems: Item[] = [];

  categories: Category[] = [
    { categoryId: 1, categoryName: 'Electrónica', description: 'Dispositivos electrónicos' },
    { categoryId: 2, categoryName: 'Joyería', description: 'Collares, anillos y más' },
    { categoryId: 3, categoryName: 'Vehículos', description: 'Carros, motos y más' },
    { categoryId: 4, categoryName: 'Otros', description: 'Otros no descritos' }
  ];

  items: Item[] = [
    { itemID: 1, categoryId: 1, nameItem: 'Laptop Gamer', brand: 'Asus', photos: 'https://firebasestorage.googleapis.com/v0/b/solutec-pawn.firebasestorage.app/o/items%2Fimg_not_found.jpg?alt=media&token=c0f59d33-6a8c-4ecc-bcd0-e23b324a4cbf', description: 'Laptop potente para gaming', price: 4500 },
    { itemID: 2, categoryId: 1, nameItem: 'Reloj Inteligente', brand: 'Apple', photos: '/assets/products/Laptop.jpg', description: 'Smartwatch de última generación', price: 2500 },
    { itemID: 3, categoryId: 2, nameItem: 'Pulsera', brand: 'Pandora', photos: '/assets/products/Laptop.jpg', description: 'Pulsera elegante', price: 800 },
    { itemID: 4, categoryId: 2, nameItem: 'Collar', brand: 'Swarovski', photos: '/assets/products/Laptop.jpg', description: 'Collar de lujo', price: 1200 },
    { itemID: 5, categoryId: 1, nameItem: 'Televisor LED', brand: 'Samsung', photos: '/assets/products/Laptop.jpg', description: 'TV 4K 55 pulgadas', price: 5500 },
    { itemID: 5, categoryId: 1, nameItem: 'Televisor LED', brand: 'Samsung', photos: '/assets/products/Laptop.jpg', description: 'TV 4K 55 pulgadas', price: 5500 },
    { itemID: 5, categoryId: 3, nameItem: 'Televisor LED', brand: 'Samsung', photos: '/assets/products/Laptop.jpg', description: 'TV 4K 55 pulgadas', price: 5500 },
    { itemID: 5, categoryId: 1, nameItem: 'Televisor LED', brand: 'Samsung', photos: '/assets/products/Laptop.jpg', description: 'TV 4K 55 pulgadas', price: 5500 },
    { itemID: 5, categoryId: 1, nameItem: 'Televisor LED', brand: 'Samsung', photos: '/assets/products/Laptop.jpg', description: 'TV 4K 55 pulgadas', price: 5500 },
    { itemID: 5, categoryId: 1, nameItem: 'Televisor LED', brand: 'Samsung', photos: '/assets/products/Laptop.jpg', description: 'TV 4K 55 pulgadas', price: 5500 },
    { itemID: 5, categoryId: 1, nameItem: 'Televisor LED', brand: 'Samsung', photos: '/assets/products/Laptop.jpg', description: 'TV 4K 55 pulgadas', price: 5500 },
    { itemID: 5, categoryId: 1, nameItem: 'Televisor LED', brand: 'Samsung', photos: '/assets/products/Laptop.jpg', description: 'TV 4K 55 pulgadas', price: 5500 },
    { itemID: 5, categoryId: 1, nameItem: 'Televisor LED', brand: 'Samsung', photos: '/assets/products/Laptop.jpg', description: 'TV 4K 55 pulgadas', price: 5500 },
    { itemID: 6, categoryId: 2, nameItem: 'Anillo', brand: 'Cartier', photos: '/assets/products/Laptop.jpg', description: 'Anillo de oro', price: 4000 }
  ];

  comments = [
    { user: 'Carlos López', message: 'Excelente atención y productos en muy buen estado.', rating: 5 },
    { user: 'María Pérez', message: 'El envío fue rápido y el producto tal como se describe.', rating: 4 },
    { user: 'Juan Rodríguez', message: 'Me encantó la variedad de artículos.', rating: 5 }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.filteredItems = this.items;}

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
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
    if (amount == null) return '';
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    .format(amount)
    .replace('GTQ', 'Q.');
  }

  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = this.searchTerm
        ? item.nameItem.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.brand?.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;

      const matchesCategory =
        this.selectedCategory === 'all' || item.categoryId === Number(this.selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }
}

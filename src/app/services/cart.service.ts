import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../shared/models/CartItem';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'cart';
  private items: CartItem[] = [];

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    this.loadCart();
    this.emitCartCount();
  }

  private saveCart() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    this.emitCartCount();
  }

  private emitCartCount() {
    this.cartCountSubject.next(this.getCount());
  }

  private loadCart() {
    const data = localStorage.getItem(this.storageKey);
    this.items = data ? JSON.parse(data) : [];
    this.emitCartCount();
  }

  getItems(): CartItem[] {
    return this.items;
  }

  addItem(item: CartItem) {
    const existing = this.items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push(item);
    }
    this.saveCart();
  }

  removeItem(id: number) {
    this.items = this.items.filter(i => i.id !== id);
    this.saveCart();
  }

  clearCart() {
    this.items = [];
    this.saveCart();
  }

  getTotal(): number {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  getCount(): number {
    return this.items.reduce((sum, i) => sum + i.quantity, 0);
  }
}

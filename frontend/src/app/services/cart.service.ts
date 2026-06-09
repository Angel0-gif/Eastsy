import { Injectable, computed, signal } from '@angular/core';
import { CartItem, MenuItem } from '../models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  readonly items     = this._items.asReadonly();
  readonly itemCount = computed(() => this._items().reduce((s, i) => s + i.quantity, 0));
  readonly subtotal  = computed(() => this._items().reduce((s, i) => s + i.menu_item.price * i.quantity, 0));
  readonly serviceFee = computed(() => Math.round(this.subtotal() * 0.05));
  readonly total      = computed(() => this.subtotal() + this.serviceFee());

  addItem(item: MenuItem): void {
    this._items.update(cart => {
      const existing = cart.find(c => c.menu_item.id === item.id);
      if (existing) {
        return cart.map(c =>
          c.menu_item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...cart, { menu_item: item, quantity: 1 }];
    });
  }

  removeItem(itemId: number): void {
    this._items.update(cart => cart.filter(c => c.menu_item.id !== itemId));
  }

  decreaseItem(itemId: number): void {
    this._items.update(cart =>
      cart
        .map(c => c.menu_item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c)
        .filter(c => c.quantity > 0)
    );
  }

  clear(): void {
    this._items.set([]);
  }
}

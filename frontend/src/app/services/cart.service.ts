import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  menu_item: {
    id: number;
    name: string;
    price: number;
    image?: string;
    emoji?: string;
  };
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = new BehaviorSubject<CartItem[]>([]);

  items(): CartItem[] {
    return this._items.getValue();
  }

  itemCount(): number {
    return this.items().reduce((sum, i) => sum + i.quantity, 0);
  }

  subtotal(): number {
    return this.items().reduce((sum, i) => sum + i.menu_item.price * i.quantity, 0);
  }

  serviceFee(): number {
    return Math.round(this.subtotal() * 0.05);
  }

  total(): number {
    return this.subtotal() + this.serviceFee();
  }

  addItem(menuItem: CartItem['menu_item'], quantity = 1): void {
    const current = this.items();
    const idx = current.findIndex(i => i.menu_item.id === menuItem.id);
    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
      this._items.next(updated);
    } else {
      this._items.next([...current, { menu_item: menuItem, quantity }]);
    }
  }

  remove(menuItemId: number): void {
    this._items.next(this.items().filter(i => i.menu_item.id !== menuItemId));
  }

  updateQuantity(menuItemId: number, quantity: number): void {
    if (quantity <= 0) { this.remove(menuItemId); return; }
    this._items.next(
      this.items().map(i =>
        i.menu_item.id === menuItemId ? { ...i, quantity } : i
      )
    );
  }

  clear(): void {
    this._items.next([]);
  }
}
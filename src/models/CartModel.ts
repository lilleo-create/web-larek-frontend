// models/CartModel.ts
import { EventEmitter } from '../components/base/events';
import { ICartItem } from '../types';

export class CartModel extends EventEmitter {
  private items: ICartItem[] = [];

  getItems() { return this.items.slice(); }
  getTotal() { return this.items.reduce((s, i) => s + (i.price ?? 0), 0); }

  inCart(id: string) {                    // ← добавили
    return this.items.some(i => i.id === id);
  }

  add(item: ICartItem) {
    if (this.inCart(item.id)) return;     // один экземпляр
    // гарантируем quantity
    if (typeof (item as any).quantity !== 'number') (item as any).quantity = 1;
    this.items.push(item);
    this.emit('change', this.getItems());
  }

  remove(id: string) {
    const before = this.items.length;
    this.items = this.items.filter(i => i.id !== id);
    if (this.items.length !== before) this.emit('change', this.getItems());
  }

  clear() {
    if (this.items.length === 0) return;
    this.items = [];
    this.emit('change', this.getItems());
  }
}

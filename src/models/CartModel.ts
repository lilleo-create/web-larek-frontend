import { ICartItem } from '../types/cart';
import { EventEmitter } from '../components/base/events';

export class CartModel {
    protected items: ICartItem[] = [];

    constructor(protected events: EventEmitter) {}

    getItems(): ICartItem[] {
        return this.items;
    }

    add(item: ICartItem): void {
        const existing = this.items.find((i) => i.id === item.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({ ...item, quantity: 1 });
        }
        this.events.emit('cart:change', this.getItems());
    }

    remove(id: string): void {
        const existing = this.items.find((i) => i.id === id);
        if (!existing) return;

        if (existing.quantity > 1) {
            existing.quantity -= 1;
        } else {
            this.items = this.items.filter((i) => i.id !== id);
        }
        this.events.emit('cart:change', this.getItems());
    }
}

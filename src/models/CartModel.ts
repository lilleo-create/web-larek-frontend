import { ICartItem } from '../types';
import { EventEmitter } from '../components/base/events';

const CART_STORAGE_KEY = 'cart';

export class CartModel {
    protected items: ICartItem[] = [];

    constructor(protected events: EventEmitter) {
        this.loadFromStorage();
        this.events.emit('cart:change', this.getItems());
    }

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
        this.saveToStorage();
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
        this.saveToStorage();
        this.events.emit('cart:change', this.getItems());
    }

    clear(): void {
        this.items = [];
        this.saveToStorage();
        this.events.emit('cart:change', this.getItems());
    }

    protected saveToStorage(): void {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    }

    protected loadFromStorage(): void {
        const data = localStorage.getItem(CART_STORAGE_KEY);
        if (data) {
            this.items = JSON.parse(data);
        }
    }
}

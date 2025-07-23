import { ICartItem, ICartItemInput } from '../types';
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

    getTotal(): number {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }

    add(item: ICartItemInput): void {
        const exists = this.items.some(i => i.id === item.id);
        if (!exists) {
            const itemToAdd = { ...item, quantity: 1 };
            console.log('[CartModel] pushing to items:', itemToAdd);
            this.items.push(itemToAdd);
            this.saveToStorage();
            this.events.emit('cart:change', this.getItems());
        }

    }


    remove(id: string): void {
        const lengthBefore = this.items.length;
        this.items = this.items.filter((i) => i.id !== id);
        if (this.items.length !== lengthBefore) {
            this.saveToStorage();
            this.events.emit('cart:change', this.getItems());
        }
    }
    inCart(id: string): boolean {
        return this.items.some(item => item.id === id);
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

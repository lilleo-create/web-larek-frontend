import { ICartItem, ICartItemInput } from '../types';
import { EventEmitter } from '../components/base/events';

const CART_STORAGE_KEY = 'cart';

export class CartModel extends EventEmitter {
	protected items: ICartItem[] = [];

	constructor() {
		super(); // важно вызывать super() для EventEmitter
		this.loadFromStorage();
		this.emit('change', this.getItems()); // заменил 'cart:change' на 'change' для единообразия
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
			this.emit('change', this.getItems());
		}
	}

	remove(id: string): void {
		const lengthBefore = this.items.length;
		this.items = this.items.filter((i) => i.id !== id);
		if (this.items.length !== lengthBefore) {
			this.saveToStorage();
			this.emit('change', this.getItems());
		}
	}

	inCart(id: string): boolean {
		return this.items.some(item => item.id === id);
	}

	clear(): void {
		this.items = [];
		this.saveToStorage();
		this.emit('change', this.getItems());
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

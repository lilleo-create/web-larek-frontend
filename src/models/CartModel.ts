import { ICartItem } from '../types';
import { EventEmitter } from '../components/base/events';

export class CartModel {
    protected items: Map<string, ICartItem> = new Map();

    constructor(protected events: EventEmitter) {}

    add(item: ICartItem) {
        this.items.set(item.id, item);
        this.emitChange();
    }

    remove(id: string) {
        this.items.delete(id);
        this.emitChange();
    }

    clear() {
        this.items.clear();
        this.emitChange();
    }

    getItems(): ICartItem[] {
        return Array.from(this.items.values());
    }

    protected emitChange() {
        this.events.emit('cart:change', this.getItems());
    }
}

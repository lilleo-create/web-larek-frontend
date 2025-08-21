import { EventEmitter } from '../components/base/events';
import { CartModel } from '../models/CartModel';
import { CartView } from '../components/views/CartView';
import Modal from '../components/views/ModalView';

import OrderView from '../components/views/OrderView';
import { UserFormPresenter } from './UserFormPresenter';
import { ICartItem } from '../types';

export type CartItem = {
  id: string;
  price: number | string;
  [key: string]: unknown;
};

type ItemsLike = unknown;

const isNumber = (v: unknown): v is number => typeof v === 'number' && !Number.isNaN(v);
const toNumber = (v: unknown): number => (isNumber(v) ? v : Number(v ?? 0));

const isCartItem = (v: unknown): v is CartItem => {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  const hasId = typeof o.id === 'string';
  const hasPrice = typeof o.price === 'number' || typeof o.price === 'string';
  return hasId && hasPrice;
};

const isCartItemArray = (v: unknown): v is CartItem[] => Array.isArray(v) && v.every(isCartItem);

const hasMethod = <K extends string>(obj: unknown, name: K): obj is Record<K, (...args: unknown[]) => unknown> =>
  !!obj && typeof (obj as Record<string, unknown>)[name] === 'function';

const hasArrayProp = <K extends string>(obj: unknown, name: K): obj is Record<K, unknown[]> =>
  !!obj && Array.isArray((obj as Record<string, unknown>)[name]);

export class CartPresenter {
  private basketShown = false;

  constructor(
    private model: CartModel,
    private view: CartView,
    private events: EventEmitter,
    private modal: Modal
  ) {
    this.events.on('cart:open', () => this.open());
    this.events.on('cart:changed', () => {
      this.emitCartCount();
      this.refreshIfOpen();
    });

    this.events.on('cart:clear', () => {
      if (hasMethod(this.model, 'clear')) {
        this.model.clear();
      } else {
        this.events.emit('cart:changed');
      }
      this.emitCartCount(0);
      this.refreshIfOpen();
      this.emitCartQuietUpdate();
    });

    this.events.on('cart:delete', ({ id }: { id: string }) => {
      if (hasMethod(this.model, 'remove')) {
        this.model.remove(id as unknown as string);
      }
      this.emitCartCount();
      this.refreshIfOpen();
    });

    this.events.on('cart:order', () => {
      const orderView = new OrderView('#order');
      const formEl = orderView.render();
      this.modal.setContent(formEl);
      this.modal.open();
      this.basketShown = false;

      new UserFormPresenter(orderView, this.events, this.modal);
    });

    this.emitCartCount();
  }

  private mapToICart(items: CartItem[]): ICartItem[] {
    return items.map((it) => {
      const t = it['title'];
      const n = it['name'];
      const title =
        (typeof t === 'string' && t.trim()) ? t :
        (typeof n === 'string' && n.trim()) ? n :
        'Товар';

      const q = it['quantity'];
      const quantity =
        typeof q === 'number' ? q :
        (typeof q === 'string' && q.trim() !== '' && !Number.isNaN(Number(q))) ? Number(q) :
        1;

      return {
        id: it.id,
        title,
        price: toNumber(it.price),
        quantity,
      };
    });
  }

  private emitCartQuietUpdate(): void {
    const items = this.getItems();
    const count = items.length;
    const total = items.reduce((sum, it) => sum + toNumber(it.price), 0);
    this.events.emit('cart:updated:quiet', { count, total });
  }

  private getItems(): CartItem[] {
    if (hasMethod(this.model, 'getItems')) {
      const arr = this.model.getItems() as ItemsLike;
      return isCartItemArray(arr) ? arr : [];
    }

    if (hasArrayProp(this.model, 'items')) {
      const arr = (this.model as Record<string, unknown[]>).items;
      return isCartItemArray(arr) ? arr : [];
    }

    return [];
  }

  private getTotal(): number {
    if (hasMethod(this.model, 'getTotal')) {
      return toNumber(this.model.getTotal());
    }
    return this.getItems().reduce((sum, it) => sum + toNumber(it.price), 0);
  }

  private emitCartCount(forceCount?: number): void {
    const count = forceCount ?? this.getItems().length;
    this.events.emit('cart:count', { count });
  }

  private refreshIfOpen(): void {
    if (!this.modal.isOpen()) return;
    if (!this.basketShown) return;

    const content = this.view.render(this.mapToICart(this.getItems()), this.getTotal());
    this.modal.setContent(content);
  }

  private open(): void {
    const content = this.view.render(this.mapToICart(this.getItems()), this.getTotal());
    this.modal.setContent(content);
    this.modal.open();
    this.basketShown = true;
  }
}

export default CartPresenter;

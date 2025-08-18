import { EventEmitter } from '../components/base/events';
import { CartModel } from '../models/CartModel';
import { CartView } from '../components/views/CartView';
import Modal from '../components/views/ModalView';

import { addressForm } from '../components/base/dom';
import { UserView } from '../components/views/UserView';
import { UserFormPresenter } from './UserFormPresenter';

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
      const m: any = this.model as any;
      if (typeof m.clear === 'function') {
        m.clear();
      } else {
        this.events.emit('cart:changed', {});
      }
      this.emitCartCount(0);
      this.refreshIfOpen();
    });

    this.events.on('cart:delete', ({ id }: { id: string }) => {
      const m: any = this.model as any;
      if (typeof m.remove === 'function') m.remove(id);
      this.emitCartCount();
      this.refreshIfOpen();
    });

    this.events.on('cart:order', () => {
      if (!(addressForm instanceof HTMLFormElement)) {
        console.error('addressForm not found or not a form element');
        return;
      }
      this.modal.setContent(addressForm);
      this.modal.open();

      this.basketShown = false;

      const userView = new UserView(addressForm, this.events);
      new UserFormPresenter(userView, this.events, this.modal);
    });

    this.emitCartCount();
  }

  private getItems(): any[] {
    const m: any = this.model as any;
    if (typeof m.getItems === 'function') return m.getItems();
    return Array.isArray(m.items) ? [...m.items] : [];
  }

  private getTotal(): number {
    const m: any = this.model as any;
    if (typeof m.getTotal === 'function') return m.getTotal();
    return this.getItems().reduce((sum, it) => sum + (it?.price ?? 0), 0);
  }

  private emitCartCount(forceCount?: number): void {
    const count = forceCount ?? this.getItems().length;
    this.events.emit('cart:count', { count });
  }

  private refreshIfOpen(): void {
    if (!this.modal.isOpen()) return;
    if (!this.basketShown) return;

    const content = this.view.render(this.getItems(), this.getTotal());
    this.modal.setContent(content);
  }

  private open(): void {
    const content = this.view.render(this.getItems(), this.getTotal());
    this.modal.setContent(content);
    this.modal.open();
    this.basketShown = true;
  }
}

export default CartPresenter;

// src/presenters/CartPresenter.ts
import { CartModel } from '../models/CartModel';
import { CartView } from '../components/views/CartView';
import { EventEmitter } from '../components/base/events';
import Modal from '../components/views/ModalView';
import OrderView from '../components/views/OrderView';
import { UserFormPresenter } from './UserFormPresenter';
import { ICartItem } from '../types';

export class CartPresenter {
  constructor(
    private model: CartModel,
    private view: CartView,
    private events: EventEmitter,
    private modal: Modal
  ) {
    this.events.on('cart:open', this.openCart);
    this.events.on('cart:remove', ({ id }: { id: string }) => this.model.remove(id));
    this.events.on('cart:order', this.openOrder);
    this.events.on('cart:clear', () => this.model.clear());

    this.model.on('change', (items: ICartItem[]) => {
      const total = items.reduce((s, i) => s + i.price, 0);
      this.updateCartCount(items.length);

      // Перерисовываем корзину только если в модалке сейчас видна корзина
      const modalIsOpen =
        typeof (this.modal as any).isOpen === 'function'
          ? (this.modal as any).isOpen()
          : true;

      if (modalIsOpen) {
        const modalRoot = (document.querySelector('.modal') || document.body) as Element;
        const basketInModal = !!modalRoot.querySelector('.basket');
        if (basketInModal) {
          this.modal.setContent(this.view.render(items, total));
        }
      }
    });

    this.updateCartCount(this.model.getItems().length);
  }

  private openCart = () => {
    const items = this.model.getItems();
    const total = items.reduce((s, i) => s + i.price, 0);
    this.modal.setContent(this.view.render(items, total));
    this.modal.open();
  };

  private openOrder = () => {
    const orderView = new OrderView('#order'); // клонирует <template id="order">
    const formEl = orderView.render();
    this.modal.setContent(formEl);
    new UserFormPresenter(orderView, this.events, this.modal); // связываем шаги заказа
    this.modal.open();
  };

  private updateCartCount(count: number) {
    const el = document.querySelector('.header__basket-counter') as HTMLElement | null;
    if (!el) return;
    el.textContent = String(count);
    // всегда видим
    el.style.display = '';
    el.style.visibility = 'visible';
    el.classList.remove('hidden', 'visually-hidden');
    el.removeAttribute('hidden');
  }
}

// src/presenters/CartPresenter.ts
import { CartModel } from '../models/CartModel';
import { CartView } from '../components/views/CartView';
import { EventEmitter } from '../components/base/events';
import Modal from '../components/views/ModalView';
import { UserView } from '../components/views/UserView';
import { UserFormPresenter } from './UserFormPresenter';
import { ICartItem } from '../types';

export class CartPresenter {
  constructor(
    private model: CartModel,
    private view: CartView,
    private events: EventEmitter,
    private modal: Modal
  ) {
    // открыть корзину
    this.events.on('cart:open', this.openCart);

    // удалить товар (CartView шлёт { index })
    this.events.on('cart:delete', ({ index }: { index: number }) => {
      const items = this.model.getItems();
      const item = items[index];
      if (item) this.model.remove(item.id);
    });

    // оформить заказ -> открыть шаг "Способ оплаты + адрес"
    this.events.on('cart:order', this.openOrder);

    // очистить корзину
    this.events.on('cart:clear', () => this.model.clear());

    // обновления модели корзины
    this.model.on('change', (items: ICartItem[]) => {
      // счётчик у иконки
      this.updateCartCount(items.length);

      // если модалка корзины открыта — перерисуем её содержимое
      if (this.modal.element.classList.contains('modal_active')) {
        const el = this.view.render(items, this.model.getTotal());
        this.modal.setContent(el);
      }
    });

    // первичное состояние счётчика
    this.updateCartCount(this.model.getItems().length);
  }

  private openCart = () => {
    const items = this.model.getItems();
    const total = this.model.getTotal();
    const cartElement = this.view.render(items, total);
    this.modal.setContent(cartElement);
    this.modal.open();
  };

  private openOrder = () => {
    const template = document.querySelector<HTMLTemplateElement>('#order');
    if (!template) throw new Error('Template #order not found');

    const content = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const form = content as HTMLFormElement;

    this.modal.setContent(content);

    // подключаем форму заказа
    const userView = new UserView(form, this.events);
    new UserFormPresenter(userView, this.events, this.modal);

    this.modal.open();
  };

  private updateCartCount(count: number) {
    const el = document.querySelector('.header__basket-counter') as HTMLElement | null;
    if (!el) return;
    el.textContent = String(count);
    
  }
}

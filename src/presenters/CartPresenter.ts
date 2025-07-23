import { CartModel } from '../models/CartModel';
import { CartView } from '../components/views/CartView';
import { EventEmitter } from '../components/base/events';
import { ICartItem } from '../types';
import { basketCounter, cartElement } from '../components/base/dom';
import { Modal } from '../components/views/ModalView';

export class CartPresenter {
  constructor(
    protected model: CartModel,
    protected view: CartView,
    protected events: EventEmitter,
    protected modal: Modal
  ) {
    this.events.on('cart:change', this.handleCartChange.bind(this));
    cartElement.addEventListener('item:remove', this.handleRemoveItem.bind(this));
    document.querySelector('.header__basket')?.addEventListener('click', this.openBasketModal.bind(this));
  }

 protected handleCartChange(items: ICartItem[]) {
  this.view.render(items, this.model.getTotal());
  basketCounter.textContent = String(items.length);
}


  protected handleRemoveItem(event: Event) {
    const id = (event as CustomEvent).detail;
    this.model.remove(id);
  }

  protected openBasketModal() {
    const el = document.getElementById('modal-basket');
    if (!el) return;

    const content = el.querySelector('.modal__content') as HTMLElement;

    this.modal.setContent(content);         // вставляем содержимое модалки
    this.view.render(                       // отрисовываем список корзины
      this.model.getItems(),
      this.model.getTotal()
    );
    this.modal.open();
  }

}

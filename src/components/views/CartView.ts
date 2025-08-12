// components/views/CartView.ts
import { ICartItem } from '../../types';
import { EventEmitter } from '../base/events';

export class CartView {
  protected basketTemplate: HTMLTemplateElement;
  protected itemTemplate: HTMLTemplateElement;
  private counterEl: HTMLElement | null;

  constructor(
    protected events: EventEmitter,
    basketTemplate: HTMLTemplateElement,
    itemTemplate: HTMLTemplateElement
  ) {
    this.basketTemplate = basketTemplate;
    this.itemTemplate = itemTemplate;

    const basketButton = document.querySelector('.header__basket');
    if (!basketButton) throw new Error('Cart button (.header__basket) not found');
    basketButton.addEventListener('click', () => this.events.emit('cart:open'));

    this.counterEl = document.querySelector('.header__basket-counter');
  }

  updateCounter(count: number) {
    if (!this.counterEl) return;
    this.counterEl.textContent = String(count);
    this.counterEl.style.display = count > 0 ? 'block' : 'none';
  }

  render(items: ICartItem[], total: number): HTMLElement {
    const basketElement = this.basketTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;

    const list = basketElement.querySelector('.basket__list') as HTMLElement | null;
    const totalEl = basketElement.querySelector('.basket__price') as HTMLElement | null;
    const orderButton = basketElement.querySelector('.basket__button') as HTMLButtonElement | null;
    if (!list || !totalEl || !orderButton) throw new Error('Basket template missing required elements');

    list.replaceChildren();

    if (items.length === 0) {
      const emptyEl = document.createElement('li');
      emptyEl.textContent = 'Корзина пуста';
      emptyEl.classList.add('basket__empty');
      list.append(emptyEl);
      orderButton.setAttribute('disabled', 'true');
    } else {
      items.forEach((item, index) => {
        const itemEl = this.itemTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const titleEl = itemEl.querySelector('.card__title');
        const priceEl = itemEl.querySelector('.card__price');
        const idxEl = itemEl.querySelector('.basket__item-index');
        const delBtn = itemEl.querySelector('.basket__item-delete');

        if (!titleEl || !priceEl || !idxEl || !delBtn) {
          throw new Error('Basket item template missing required elements');
        }

        (titleEl as HTMLElement).textContent = item.title;
        (priceEl as HTMLElement).textContent = `${item.price} синапсов`;
        (idxEl as HTMLElement).textContent = String(index + 1);

        (delBtn as HTMLElement).addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.events.emit('cart:delete', { id: item.id });
        });

        list.append(itemEl);
      });
      orderButton.removeAttribute('disabled');
    }

    totalEl!.textContent = `${total} синапсов`;

    orderButton!.addEventListener('click', (e) => {
      e.preventDefault();
      this.events.emit('cart:order');
    });

    return basketElement;
  }
}

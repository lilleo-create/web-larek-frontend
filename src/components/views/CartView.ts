import { ICartItem } from '../../types';
import { EventEmitter } from '../base/events';
import { CardBasketView } from './CardBasketView';

export class CartView {
  constructor(
    protected events: EventEmitter,
    protected basketTemplate: HTMLTemplateElement,
    protected itemTemplate: HTMLTemplateElement
  ) {}

  render(items: ICartItem[], total: number): HTMLElement {
    const frag = this.basketTemplate.content.cloneNode(true) as DocumentFragment;
    const basket = frag.querySelector('.basket') as HTMLElement;
    const list = basket.querySelector('.basket__list') as HTMLElement;
    const totalEl = basket.querySelector('.basket__price') as HTMLElement;
    const orderBtn = basket.querySelector('.basket__button') as HTMLButtonElement;

    // ── пустое состояние ───────────────────────────────────────────────
    let emptyEl = basket.querySelector('.basket__empty') as HTMLElement | null;
    if (!emptyEl) {
      emptyEl = document.createElement('p');
      emptyEl.className = 'basket__empty';
      emptyEl.textContent = 'Корзина пуста';
      emptyEl.setAttribute('aria-live', 'polite');
      // вставим рядом со списком
      if (list && list.parentElement) {
        list.parentElement.insertBefore(emptyEl, list);
      } else {
        basket.prepend(emptyEl);
      }
    }

    // ── список товаров ─────────────────────────────────────────────────
    list.innerHTML = '';
    items.forEach((item, i) => {
      const view = new CardBasketView(this.itemTemplate);
      view.onDelete = (id) => this.events.emit('cart:remove', { id });
      list.appendChild(
        view.render({ id: item.id, index: i + 1, title: item.title, price: item.price })
      );
    });

    // ── итог/кнопки/пустое состояние ───────────────────────────────────
    if (totalEl) totalEl.textContent = `${total} синапсов`;

    const isEmpty = items.length === 0;
    if (emptyEl) emptyEl.style.display = isEmpty ? 'block' : 'none';
    if (orderBtn) {
      orderBtn.disabled = isEmpty;
      orderBtn.onclick = () => this.events.emit('cart:order');
    }

    return basket;
  }
}

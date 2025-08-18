// components/views/CartView.ts
import { ICartItem } from '../../types';
import { EventEmitter } from '../base/events';

export class CartView {
  constructor(
    protected events: EventEmitter,
    private basketTemplate: HTMLTemplateElement,   // <template id="basket">
    private itemTemplate: HTMLTemplateElement      // <template id="card-basket">
  ) {}

  updateCounter(_count: number): void {}

  render(items: ICartItem[], total: number): HTMLElement {
    const basketEl = this.basketTemplate.content.firstElementChild?.cloneNode(true) as HTMLElement;
    if (!basketEl) throw new Error('Basket template is empty');

    // строго по твоему #basket
    const list = basketEl.querySelector('.basket__list') as HTMLElement | null;
    const actions = basketEl.querySelector('.modal__actions') as HTMLElement | null;
    const totalEl = actions?.querySelector('.basket__price') as HTMLElement | null;
    const orderBtn = actions?.querySelector('.basket__button') as HTMLButtonElement | null;

    if (!list || !totalEl || !orderBtn) {
      // диагностический лог: один раз покажет, чего именно не хватило
      // (оставь на время, потом можно убрать)
      console.error('[CartView] basket clone:', basketEl.outerHTML.slice(0, 4000));
      console.error('[CartView] found:', {
        list: !!list, actions: !!actions, totalEl: !!totalEl, orderBtn: !!orderBtn,
      });
      throw new Error('Basket template missing required elements (.basket__list / .basket__price / .basket__button)');
    }

    list.replaceChildren();

    if (items.length === 0) {
      const li = document.createElement('li');
      li.className = 'basket__empty';
      li.textContent = 'Корзина пуста';
      list.append(li);
      orderBtn.disabled = true;
    } else {
      items.forEach((item, index) => {
        const li = this.itemTemplate.content.firstElementChild?.cloneNode(true) as HTMLElement;
        if (!li) throw new Error('Basket item template is empty');

        // строго по твоему #card-basket
        const idxEl   = li.querySelector('.basket__item-index') as HTMLElement | null;
        const titleEl = li.querySelector('.card__title') as HTMLElement | null;
        const priceEl = li.querySelector('.card__price') as HTMLElement | null;
        const delBtn  = li.querySelector('.basket__item-delete') as HTMLButtonElement | null;

        if (!idxEl || !titleEl || !priceEl || !delBtn) {
          console.error('[CartView] item clone:', li.outerHTML);
          throw new Error('Basket item template missing required elements (.basket__item-index / .card__title / .card__price / .basket__item-delete)');
        }

        idxEl.textContent = String(index + 1);
        titleEl.textContent = item.title;
        priceEl.textContent = `${item.price} синапсов`;

        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.events.emit('cart:delete', { id: item.id });
        });

        list.append(li);
      });
      orderBtn.disabled = false;
    }

    totalEl.textContent = `${total} синапсов`;

    orderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.events.emit('cart:order', {});
    });

    return basketEl;
  }
}

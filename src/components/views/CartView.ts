import { ICartItem } from '../../types';
import { EventEmitter } from '../base/events';

export class CartView {
	protected basketTemplate: HTMLTemplateElement;
	protected itemTemplate: HTMLTemplateElement;

	constructor(
		protected events: EventEmitter,
		basketTemplate: HTMLTemplateElement,
		itemTemplate: HTMLTemplateElement
	) {
		this.basketTemplate = basketTemplate;
		this.itemTemplate = itemTemplate;

		// подписка на клик по иконке корзины
		const basketButton = document.querySelector('.header__basket');
		if (!basketButton) throw new Error('Cart button (.header__basket) not found');

		basketButton.addEventListener('click', () => {
			this.events.emit('cart:open');
		});

	}

render(items: ICartItem[], total: number): HTMLElement {
  const basketElement = this.basketTemplate.content.firstElementChild!
    .cloneNode(true) as HTMLElement;

  const list = basketElement.querySelector('.basket__list') as HTMLUListElement;
  const totalEl = basketElement.querySelector('.basket__price') as HTMLElement;
  // кнопка может быть и по классу, и по data-атрибуту — подстрахуемся
  const orderButton = (basketElement.querySelector('.basket__button') ||
                      basketElement.querySelector('[data-next="order"]')) as HTMLButtonElement;

  // цена всегда актуальна
  totalEl.textContent = `${total} синапсов`;

  // ---------- ПУСТОЕ СОСТОЯНИЕ ----------
  if (!items || items.length === 0) {
    list.innerHTML = '';
    const empty = document.createElement('li');
    empty.className = 'basket__empty';
    empty.textContent = 'Корзина пуста';
    list.appendChild(empty);

    if (orderButton) orderButton.disabled = true;
    return basketElement;
  }

  // ---------- НЕ ПУСТО ----------
  list.innerHTML = '';
  items.forEach((item, index) => {
    const itemEl = this.itemTemplate.content.firstElementChild!.cloneNode(true) as HTMLElement;
    (itemEl.querySelector('.card__title') as HTMLElement).textContent = item.title;
    (itemEl.querySelector('.card__price') as HTMLElement).textContent = `${item.price} синапсов`;
    (itemEl.querySelector('.basket__item-index') as HTMLElement).textContent = String(index + 1);

    (itemEl.querySelector('.basket__item-delete') as HTMLButtonElement)
      .addEventListener('click', () => this.events.emit('cart:delete', { index }));

    list.append(itemEl);
  });

  if (orderButton) {
    orderButton.disabled = false;
    orderButton.addEventListener('click', () => this.events.emit('cart:order'));
  }

  return basketElement;
}

}

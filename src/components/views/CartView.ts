import { ICartItem } from '../../types';
import { CardBasketView } from './CardBasketView';
import { EventEmitter } from '../base/events';

export class CartView {
	constructor(
		protected element: HTMLElement, // .basket
		protected events: EventEmitter,
		protected cardBasketView: CardBasketView
	) {}

	render(cartItems: ICartItem[], total: number): void {
		const list = this.element.querySelector('.basket__list') as HTMLElement | null;
		const price = this.element.querySelector('.basket__price') as HTMLElement | null;
		const orderButton = this.element.querySelector('.button[data-next="order"]') as HTMLButtonElement | null;

		if (!list || !price || !orderButton) {
			console.warn('CartView: Один из элементов не найден в .basket');
			return;
		}

		list.innerHTML = '';

		if (cartItems.length === 0) {
			const emptyText = document.createElement('p');
			emptyText.classList.add('basket__empty');
			emptyText.textContent = 'Корзина пуста';
			list.appendChild(emptyText);
			orderButton.disabled = true;
		} else {
			cartItems.forEach((item, index) => {
				const card = this.cardBasketView.render(item, index);
				list.appendChild(card);
			});
			orderButton.disabled = false;
		}

		price.textContent = `${total} синапсов`;
	}
}

import { ICartItem } from '../../types';
import { EventEmitter } from '../base/events';
import { CardBasketView } from './CardBasketView';

export class CartView {
	protected priceElement: HTMLElement;
	protected orderButton: HTMLButtonElement;

	constructor(
		protected element: HTMLElement,
		protected events: EventEmitter,
		protected cardView: CardBasketView
	) {
		this.priceElement = document.querySelector('.basket__price') as HTMLElement;
		this.orderButton = document.querySelector('.basket .button[data-next="order"]') as HTMLButtonElement;
	}

	render(items: ICartItem[], totalPrice: number) {
		this.element.innerHTML = '';

		if (items.length === 0) {
			const emptyText = document.createElement('p');
			emptyText.classList.add('basket__empty');
			emptyText.textContent = 'Корзина пуста';
			this.element.appendChild(emptyText);
		} else {
			items.forEach((item, index) => {
				const card = this.cardView.create(item, index);
				this.element.appendChild(card);
			});
		}

		this.priceElement.textContent = `${totalPrice} синапсов`;
		this.orderButton.disabled = items.length === 0;
	}
}

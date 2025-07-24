import { ICartItem } from '../../types';
import { CardBasketView } from './CardBasketView';
import { EventEmitter } from '../base/events';

export class CartView {
	constructor(
		protected container: HTMLElement, // modal__content
		protected events: EventEmitter,
		protected cardBasketView: CardBasketView
	) {}

	render(cartItems: ICartItem[], total: number): void {
		// 1. Получаем шаблон
		const template = document.getElementById('basket') as HTMLTemplateElement;
		const clone = template.content.cloneNode(true) as DocumentFragment;
		const basket = clone.querySelector('.basket') as HTMLElement;

		// 2. Находим нужные элементы
		const list = basket.querySelector('.basket__list')!;
		const price = basket.querySelector('.basket__price')!;
		const orderButton = basket.querySelector('.button[data-next="order"]') as HTMLButtonElement;

		// 3. Рендерим список
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

		// 4. Обработка клика по кнопке оформления
		orderButton.addEventListener('click', () => {
			this.events.emit('order:open');
		});

		// 5. Вставляем отрендеренный блок в модалку
		this.container.innerHTML = '';
		this.container.appendChild(basket);
	}
}

import { IProduct } from '../../types';
import { CartModel } from '../../models/CartModel';
import { EventEmitter } from '../base/events';

export class CardPreviewView {
	constructor(
		private product: IProduct,
		private cartModel: CartModel,
		private events: EventEmitter
	) { }

	render(): HTMLElement {
		const template = document.getElementById('card-preview') as HTMLTemplateElement;
		const fragment = template.content.cloneNode(true) as DocumentFragment;
		const card = fragment.querySelector('.card') as HTMLElement;

		const categoryEl = card.querySelector('.card__category') as HTMLElement;
		const titleEl = card.querySelector('.card__title') as HTMLElement;
		const textEl = card.querySelector('.card__text') as HTMLElement;
		const priceEl = card.querySelector('.card__price') as HTMLElement;
		const imgEl = card.querySelector('.card__image') as HTMLImageElement;
		const buyButton = card.querySelector('.card__button') as HTMLButtonElement;

		// Заполняем данные карточки
		categoryEl.textContent = this.product.category;
		categoryEl.classList.add(`card__category_${this.product.categoryType}`);
		titleEl.textContent = this.product.title;
		textEl.textContent = this.product.description;
		priceEl.textContent =
			typeof this.product.price === 'number'
				? `${this.product.price} синапсов`
				: this.product.price;

		imgEl.src = this.product.image;
		imgEl.alt = this.product.title;

		// Обновление состояния кнопки
		const updateButtonState = () => {
			const isInCart = this.cartModel.getItems().some(i => i.id === this.product.id);
			buyButton.textContent = isInCart ? 'Удалить из корзины' : 'Купить';
		};

		updateButtonState();
		this.events.on('cart:change', updateButtonState);

		// Обработчик кнопки "Купить"
		buyButton.addEventListener('click', () => {
			console.log('[CardPreviewView] Клик по кнопке');
			if (this.product.disabled) return;

			const isInCart = this.cartModel.getItems().some(i => i.id === this.product.id);

			if (isInCart) {
				this.cartModel.remove(this.product.id);
			} else {
				this.cartModel.add({
					id: this.product.id,
					title: this.product.title,
					price: typeof this.product.price === 'number' ? this.product.price : 0
				});
			}

			updateButtonState();
		});

		// Оборачиваем карточку в div, чтобы можно было вернуть полноценный HTMLElement
		const wrapper = document.createElement('div');
		wrapper.appendChild(card);

		 return card;
	}
}

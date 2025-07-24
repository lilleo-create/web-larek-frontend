import { IProduct } from '../../types';
import { CartModel } from '../../models/CartModel';
import { EventEmitter } from '../base/events';

export class CardPreviewView {
	constructor(
		private product: IProduct,
		private cartModel: CartModel,
		private events: EventEmitter
	) {}

	render(): HTMLElement {
		const template = document.getElementById('card-preview') as HTMLTemplateElement;
		const clone = template.content.cloneNode(true) as DocumentFragment;
		const card = clone.querySelector('.card') as HTMLElement;

		const categoryEl = card.querySelector('.card__category')!;
		const titleEl = card.querySelector('.card__title')!;
		const textEl = card.querySelector('.card__text')!;
		const priceEl = card.querySelector('.card__price')!;
		const imgEl = card.querySelector('.card__image') as HTMLImageElement;
		const buyButton = card.querySelector('.card__button') as HTMLButtonElement;

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

		const updateButtonState = () => {
			const inCart = this.cartModel.inCart(this.product.id);
			buyButton.textContent = inCart ? 'Удалить из корзины' : 'Купить';
		};

		updateButtonState();
		this.events.on('cart:change', updateButtonState);

		buyButton.addEventListener('click', () => {
			console.log('[CardPreviewView] Клик по кнопке');
			if (this.product.disabled) return;
			
			const inCart = this.cartModel.inCart(this.product.id);
			if (inCart) {
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

		return card;
	}
}

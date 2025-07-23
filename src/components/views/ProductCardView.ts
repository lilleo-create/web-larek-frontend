import { IProduct } from '../../types';

export class ProductCardView {
	private _onClick?: (id: string) => void;
	private _onBuy?: (id: string) => void;

	constructor(private template: HTMLTemplateElement) {}

	set onClick(fn: (id: string) => void) {
		this._onClick = fn;
	}

	set onBuy(fn: (id: string) => void) {
		this._onBuy = fn;
	}

	render(product: IProduct): HTMLElement {
		const fragment = this.template.content.cloneNode(true) as DocumentFragment;
		const wrapper = document.createElement('div');
		wrapper.appendChild(fragment);
		const card = wrapper.firstElementChild as HTMLElement;

		const categoryEl = card.querySelector('.card__category') as HTMLElement;
		const titleEl = card.querySelector('.card__title') as HTMLElement;
		const priceEl = card.querySelector('.card__price') as HTMLElement;
		const imgEl = card.querySelector('.card__image') as HTMLImageElement;

		categoryEl.textContent = product.category;
		categoryEl.classList.add(`card__category_${product.categoryType}`);
		console.log('[ProductCardView] render:', product.title);

		titleEl.textContent = product.title;
		priceEl.textContent =
			typeof product.price === 'string'
				? product.price
				: `${product.price} синапсов`;

		imgEl.src = product.image;
		imgEl.alt = product.title;

		card.dataset.id = product.id;

		// Открытие карточки
		card.addEventListener('click', () => this._onClick?.(product.id));

		// Покупка товара
		const buttonEl = card.querySelector('.card__button') as HTMLButtonElement;
		if (buttonEl) {
			buttonEl.addEventListener('click', (e) => {
				e.stopPropagation(); // чтобы не сработал onClick при клике на кнопку
				this._onBuy?.(product.id);
			});
		}

		return card;
	}
}

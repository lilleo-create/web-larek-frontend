import { IProduct } from '../../types';
import { EventEmitter } from '../base/events';

export class ProductCardView extends EventEmitter {
	public product: IProduct;
	private element: HTMLElement;

	constructor(template: HTMLTemplateElement, product: IProduct) {
		super();
		this.product = product;

		const clone = template.content.cloneNode(true) as DocumentFragment;
		const element = clone.querySelector('.card') as HTMLElement;

		if (!element) {
			throw new Error('[ProductCardView] Элемент .card не найден в шаблоне!');
		}

		this.element = element;

		const titleEl = this.element.querySelector('.card__title') as HTMLElement;
		const priceEl = this.element.querySelector('.card__price') as HTMLElement;

		if (!titleEl || !priceEl) {
			throw new Error('[ProductCardView] Элементы title или price не найдены!');
		}

		titleEl.textContent = product.title;
		priceEl.textContent =
			typeof product.price === 'number' ? `${product.price} синапсов` : product.price;

		// Эмит клика по карточке (для открытия превью)
		this.element.addEventListener('click', () => {
			this.emit('click', { id: this.product.id });
		});
		const button = this.element.querySelector('.card__button') as HTMLButtonElement;
if (button) {
	button.addEventListener('click', (e) => {
		e.stopPropagation(); // чтобы не срабатывал открывающий модалку .card
		this.emit('buy', { id: this.product.id });
	});
}

	}

	updateButton(inCart: boolean) {
		const button = this.element.querySelector('.card__button') as HTMLButtonElement;
		if (button) {
			button.textContent = inCart ? 'Удалить' : 'Купить';
		}
	}
	
	public getElement(): HTMLElement {
		return this.element;
	}
}

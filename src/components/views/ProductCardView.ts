import { IProduct } from '../../types';
import { EventEmitter } from '../base/events';
import { CDN_URL } from '../../utils/constants';

export class ProductCardView extends EventEmitter {
	public product: IProduct;
	private element: HTMLElement;
	private buyBtn?: HTMLButtonElement | HTMLAnchorElement;

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
		const categoryEl = this.element.querySelector('.card__category') as HTMLElement;
		const imgEl = this.element.querySelector('.card__image') as HTMLImageElement;

		titleEl.textContent = product.title;
		priceEl.textContent =
			typeof product.price === 'number' ? `${product.price} синапсов` : product.price;

		categoryEl.textContent = product.category ?? 'unknown';
		categoryEl.classList.add(`card__category_${product.categoryType ?? 'unknown'}`);

		imgEl.src = `${CDN_URL}/${product.image}`;
		imgEl.alt = product.title;

		this.buyBtn =
			(this.element.querySelector('[data-role="buy"]') as HTMLButtonElement | HTMLAnchorElement) ||
			(this.element.querySelector('.card__button') as HTMLButtonElement | HTMLAnchorElement) ||
			(this.element.querySelector('button, a') as HTMLButtonElement | HTMLAnchorElement) ||
			undefined;

		if (this.buyBtn) {
			if (this.buyBtn instanceof HTMLButtonElement) {
				this.buyBtn.type = 'button';
			}
			this.buyBtn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.emit('buy', { id: this.product.id });
			});
		}
		this.element.addEventListener('click', () => {
			this.emit('click', { id: this.product.id });
		});
	}

	public setInCart(inCart: boolean) {
		if (!this.buyBtn) return;
		if (inCart) {
			this.buyBtn.textContent = 'В корзине';
			(this.buyBtn as HTMLButtonElement).disabled = true;
			this.buyBtn.classList.add('is-in-cart');
		} else {
			this.buyBtn.textContent = 'Купить';
			(this.buyBtn as HTMLButtonElement).disabled = false;
			this.buyBtn.classList.remove('is-in-cart');
		}
	}

	public getElement(): HTMLElement {
		return this.element;
	}
}

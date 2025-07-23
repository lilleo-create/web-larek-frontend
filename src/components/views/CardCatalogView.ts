import { IProduct } from '../../types';

export class CardCatalogView {
	protected template: HTMLTemplateElement;

	constructor(
		templateId: string,
		protected onClick: (id: string) => void
	) {
		this.template = document.getElementById(templateId) as HTMLTemplateElement;
	}

	create(product: IProduct): HTMLElement {
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
		titleEl.textContent = product.title;
		priceEl.textContent = typeof product.price === 'string'
			? product.price
			: `${product.price} синапсов`;
		imgEl.src = product.image;
		imgEl.alt = product.title;

		card.dataset.id = product.id;
		card.addEventListener('click', () => this.onClick(product.id));

		return card;
	}
}

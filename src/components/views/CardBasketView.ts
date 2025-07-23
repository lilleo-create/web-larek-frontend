import { ICartItem } from '../../types';
import { EventEmitter } from '../base/events';

export class CardBasketView {
	constructor(private template: HTMLTemplateElement) {}

	render(item: ICartItem, index: number): HTMLElement {
		const element = this.template.content.cloneNode(true) as HTMLElement;

		const indexEl = element.querySelector('.basket__item-index') as HTMLElement;
		const titleEl = element.querySelector('.card__title') as HTMLElement;
		const priceEl = element.querySelector('.card__price') as HTMLElement;
		const buttonEl = element.querySelector('.basket__item-delete') as HTMLButtonElement;

		indexEl.textContent = `${index + 1}`;
		titleEl.textContent = item.title;
		priceEl.textContent = `${item.price} синапсов`;

		buttonEl.addEventListener('click', () => {
			element.dispatchEvent(new CustomEvent('item:remove', {
				bubbles: true,
				detail: item.id
			}));
		});

		return element;
	}
}


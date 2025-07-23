import { ICartItem } from '../../types';
import { EventEmitter } from '../base/events';

export class CardBasketView {
	protected template: HTMLTemplateElement;

	constructor(protected events: EventEmitter) {
		this.template = document.getElementById('card-basket') as HTMLTemplateElement;
	}

	create(item: ICartItem, index: number): HTMLElement {
		const fragment = this.template.content.cloneNode(true) as DocumentFragment;

		// Обернём во временный контейнер, чтобы извлечь корневой элемент
		const wrapper = document.createElement('div');
		wrapper.appendChild(fragment);
		const li = wrapper.firstElementChild as HTMLElement;

		const indexEl = li.querySelector('.basket__item-index') as HTMLElement;
		const titleEl = li.querySelector('.card__title') as HTMLElement;
		const priceEl = li.querySelector('.card__price') as HTMLElement;
		const buttonEl = li.querySelector('.basket__item-delete') as HTMLButtonElement;

		indexEl.textContent = `${index + 1}`;
		titleEl.textContent = item.title;
		priceEl.textContent = `${item.price} синапсов`;

		buttonEl.addEventListener('click', () => {
			this.events.emit('item:remove', { id: item.id });
		});

		return li;
	}
}

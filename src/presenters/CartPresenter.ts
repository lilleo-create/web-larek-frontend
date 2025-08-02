import { CartModel } from '../models/CartModel';
import { CartView } from '../components/views/CartView';
import { CardBasketView } from '../components/views/CardBasketView';
import { EventEmitter } from '../components/base/events';
import { ICartItem } from '../types';
import Modal from '../components/views/ModalView';
import { cartElement } from '../components/base/dom';

export class CartPresenter {
	constructor(
		private model: CartModel,
		private view: CartView,
		private cardBasketView: CardBasketView,
		private events: EventEmitter,
		private modal: Modal
	) {
		this.events.on('cart:change', this.handleCartChange.bind(this));
		this.events.on('cart:clear', this.handleCartClear.bind(this));

		cartElement.addEventListener('item:remove', this.handleRemoveItem.bind(this));
		document.querySelector('.header__basket')?.addEventListener('click', this.openBasketModal.bind(this));
	}

	public init() {
		this.handleCartChange(this.model.getItems());
	}

	private handleCartChange(items: ICartItem[]) {
		const cards = items.map((item, i) => this.cardBasketView.render(item, i));
		const total = this.model.getTotal();
		this.view.render(cards, total);
		this.updateCounter(items.length);
	}

	private handleRemoveItem(event: Event) {
		const id = (event as CustomEvent).detail;
		this.model.remove(id);
	}

	private openBasketModal() {
		const template = document.getElementById('basket') as HTMLTemplateElement;
		if (!template) return;

		const clone = template.content.cloneNode(true) as DocumentFragment;
		const basket = clone.querySelector('.basket') as HTMLElement;

		this.modal.setContent(basket);
		this.view.setContainer(basket);

		const items = this.model.getItems();
		const cards = items.map((item, i) => this.cardBasketView.render(item, i));
		this.view.render(cards, this.model.getTotal());

		this.updateCounter(items.length);
		this.modal.open();
	}

	private handleCartClear() {
		this.model.clear();
		this.view.render([], 0);
		this.updateCounter(0);
	}

	private updateCounter(count: number) {
		const el = document.querySelector('.header__basket-counter') as HTMLElement;
		if (el) {
			el.textContent = String(count);
		} else {
			console.warn('[CartPresenter] basketCounter not найден!');
		}
	}
}

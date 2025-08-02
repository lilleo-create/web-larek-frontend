import { EventEmitter } from '../base/events';

export class CartView {
	private _counter: HTMLElement;

	constructor(
		private container: HTMLElement,
		private events: EventEmitter,
		counterElement: HTMLElement // <- третий аргумент конструктора
	) {
		this._counter = counterElement;
	}

	public render(cards: HTMLElement[], total: number): void {
		const list = this.container.querySelector('.basket__list')!;
		const price = this.container.querySelector('.basket__price')!;
		const orderButton = this.container.querySelector('.button[data-next="order"]') as HTMLButtonElement;

		list.innerHTML = '';

		if (cards.length === 0) {
			const emptyText = document.createElement('p');
			emptyText.classList.add('basket__empty');
			emptyText.textContent = 'Корзина пуста';
			list.appendChild(emptyText);
			orderButton.disabled = true;
		} else {
			cards.forEach(card => list.appendChild(card));
			orderButton.disabled = false;
		}

		price.textContent = `${total} синапсов`;

		orderButton.addEventListener('click', () => {
			this.events.emit('form:order');
		});
	}

	public setContainer(container: HTMLElement) {
		this.container = container;
	}

	public setCounter(count: number): void {
	console.log('[DEBUG] setCounter вызван, count =', count);
	if (this._counter) {
		this._counter.textContent = String(count);
		console.log('[DEBUG] счётчик обновлён:', this._counter.textContent);
	} else {
		console.warn('[DEBUG] _counter не найден');
	}
}

}

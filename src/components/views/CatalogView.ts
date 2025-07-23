export class CatalogView {
	constructor(
		protected element: HTMLElement
	) {}

	render(productCards: HTMLElement[]) {
		this.element.innerHTML = '';
		productCards.forEach(card => this.element.appendChild(card));
	}
}

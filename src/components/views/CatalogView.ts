import { IProduct } from '../../types';
import { ProductCardView } from './ProductCardView';

export class CatalogView {
	constructor(
		private container: HTMLElement,
		private cardView: ProductCardView
	) {}

	render(products: IProduct[]) {
		this.container.innerHTML = '';
		products.forEach(product => {
			const card = this.cardView.render(product);
			this.container.appendChild(card);
		});
	}
}

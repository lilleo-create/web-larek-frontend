import { IProduct } from '../../types';
import { ProductCardView } from './ProductCardView';

export class CatalogView {
	public template: HTMLTemplateElement;
	private container: HTMLElement;

	constructor(templateSelector: string, containerSelector: string) {
		this.template = document.querySelector(templateSelector) as HTMLTemplateElement;
		this.container = document.querySelector(containerSelector) as HTMLElement;
	}

	addCard(card: HTMLElement) {
		this.container.appendChild(card);
	}

	clear() {
		this.container.innerHTML = '';
	}
	
}



import { IProduct } from '../../types';

export class CatalogView {
    constructor(protected element: HTMLElement, protected onClick: (id: string) => void) {}

    render(products: IProduct[]) {
        this.element.innerHTML = '';
        products.forEach(product => {
            const button = document.createElement('button');
            button.textContent = `${product.title} — ${product.price}`;
            button.addEventListener('click', () => this.onClick(product.id));
            this.element.appendChild(button);
        });
    }
}

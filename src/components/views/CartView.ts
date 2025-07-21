import { ICartItem } from '../../types';

export class CartView {
    constructor(protected element: HTMLElement) {}

    render(items: ICartItem[]) {
        this.element.innerHTML = '';
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.title} — ${item.price} x${item.quantity}`;
            this.element.appendChild(li);
        });
    }
}

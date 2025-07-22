import { ICartItem } from '../../types';
import { EventEmitter } from '../base/events';

export class CartView {
    protected template: HTMLTemplateElement;

    constructor(protected element: HTMLElement, protected events: EventEmitter) {
        this.template = document.getElementById('card-basket') as HTMLTemplateElement;
    }

    render(items: ICartItem[]) {
        this.element.innerHTML = '';
        
        if (items.length === 0) {
            const emptyText = document.createElement('p');
            emptyText.classList.add('basket__empty');
            emptyText.textContent = 'Корзина пуста';
            this.element.appendChild(emptyText);
        } else {
            items.forEach((item, index) => {
                const li = this.template.content.cloneNode(true) as HTMLElement;
                const indexEl = li.querySelector('.basket__item-index') as HTMLElement;
                const titleEl = li.querySelector('.card__title') as HTMLElement;
                const priceEl = li.querySelector('.card__price') as HTMLElement;
                const buttonEl = li.querySelector('.basket__item-delete') as HTMLButtonElement;
    
                indexEl.textContent = `${index + 1}`;
                titleEl.textContent = item.title;
                priceEl.textContent = `${item.price} синапсов`;
    
                buttonEl.addEventListener('click', () => {
                    this.element.dispatchEvent(
                        new CustomEvent('item:remove', {
                            bubbles: true,
                            detail: item.id,
                        })
                    );
                });
    
                this.element.appendChild(li);
            });
        }
    
        const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const priceElement = document.querySelector('.basket__price') as HTMLElement;
        if (priceElement) {
            priceElement.textContent = `${totalPrice} синапсов`;
        }
    
        const orderButton = document.querySelector('.basket .button[data-next="order"]') as HTMLButtonElement;
        if (orderButton) {
            orderButton.disabled = items.length === 0;
        }
    }    
}

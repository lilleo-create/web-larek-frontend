import { IProduct } from '../../types';

export class CatalogView {
    protected template: HTMLTemplateElement;

    constructor(protected element: HTMLElement, protected onClick: (id: string) => void) {
        this.template = document.getElementById('card-catalog') as HTMLTemplateElement;
    }

    render(products: IProduct[]) {
        this.element.innerHTML = '';

        products.forEach(product => {
            const card = this.template.content.cloneNode(true) as HTMLElement;
            const categoryEl = card.querySelector('.card__category') as HTMLElement;
            const titleEl = card.querySelector('.card__title') as HTMLElement;
            const priceEl = card.querySelector('.card__price') as HTMLElement;
            const imgEl = card.querySelector('.card__image') as HTMLImageElement;
            const buttonEl = card.querySelector('.gallery__item') as HTMLElement;

            categoryEl.textContent = product.category;
            categoryEl.classList.add(`card__category_${product.categoryType}`);

            titleEl.textContent = product.title;
            priceEl.textContent =
            typeof product.price === 'string' ? product.price : `${product.price} синапсов`;
            imgEl.src = product.image;
            imgEl.alt = product.title;

            buttonEl.dataset.id = product.id;
            buttonEl.addEventListener('click', () => this.onClick(product.id));

            this.element.appendChild(card);
        });
    }
}

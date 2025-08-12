import { IProduct } from '../../types';
import { EventEmitter } from '../base/events';
import { CartModel } from '../../models/CartModel';
import { CDN_URL } from '../../utils/constants';

export class CardPreviewView {
  constructor(
    private product: IProduct,
    private cart: CartModel,
    private events: EventEmitter
  ) {}

  render(): HTMLElement {
    const template = document.getElementById('card-preview') as HTMLTemplateElement | null;
    if (!template) throw new Error('Template #card-preview not found');

    const clone = template.content.cloneNode(true) as DocumentFragment;
    const card = clone.querySelector('.card') as HTMLElement | null;
    if (!card) throw new Error('Preview template: .card not found');

    const categoryEl = card.querySelector('.card__category') as HTMLElement | null;
    const titleEl = card.querySelector('.card__title') as HTMLElement | null;
    const textEl = card.querySelector('.card__text') as HTMLElement | null;
    const priceEl = card.querySelector('.card__price') as HTMLElement | null;
    const imgEl = card.querySelector('.card__image') as HTMLImageElement | null;
    const buyButton = card.querySelector('.card__button') as HTMLButtonElement | null;

    // Наполняем данными, оставляя твои классы/верстку
    if (categoryEl) {
      categoryEl.textContent = this.product.category ?? 'unknown';
      categoryEl.classList.add(`card__category_${this.product.categoryType ?? 'unknown'}`);
    }
    if (titleEl) titleEl.textContent = this.product.title;
    if (textEl) textEl.textContent = this.product.description ?? '';
    if (priceEl) {
      priceEl.textContent =
        typeof this.product.price === 'number'
          ? `${this.product.price} синапсов`
          : (this.product.price ?? '');
    }
    if (imgEl) {
      imgEl.src = `${CDN_URL}/${this.product.image}`;
      imgEl.alt = this.product.title;
    }

    // Состояние и логика кнопки "Купить"
    if (buyButton) {
      const setInCart = (inCart: boolean) => {
        buyButton.textContent = inCart ? 'В корзине' : 'Купить';
        buyButton.disabled = inCart;
        buyButton.classList.toggle('is-in-cart', inCart);
      };

      setInCart(this.cart.inCart(this.product.id));

			buyButton.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
			
				if (this.cart.inCart(this.product.id)) return;
			
				this.cart.add({
					id: this.product.id,
					title: this.product.title,
					price: typeof this.product.price === 'number' ? this.product.price : 0,
					quantity: 1,
				});
			
				// смена состояния кнопки
				buyButton.textContent = 'В корзине';
				buyButton.disabled = true;
				buyButton.classList.add('is-in-cart');
			
				// обновить бейдж/итоги где подписано
				this.events.emit('cart:changed');
			
				// ПРОСИМ ЗАКРЫТЬ МОДАЛКУ — единым событийным каналом
				this.events.emit('modal:close');
			});
    }

    // Возвращаем готовый элемент карточки для модалки
    return card;
  }
}

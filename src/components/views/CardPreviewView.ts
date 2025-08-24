import { IProduct } from '../../types';
import { EventEmitter } from '../base/events';
import { CDN_URL } from '../../utils/constants';

export class CardPreviewView {
  constructor(private events: EventEmitter) {}

  // Никаких моделей и хранения product внутри View
  render(product: IProduct, inCart: boolean): HTMLElement {
    const template = document.getElementById('card-preview') as HTMLTemplateElement;
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const card = clone.querySelector('.card') as HTMLElement;

    (card.querySelector('.card__category') as HTMLElement).textContent = product.category;
    (card.querySelector('.card__title') as HTMLElement).textContent    = product.title;
    (card.querySelector('.card__text') as HTMLElement).textContent     = product.description;
    (card.querySelector('.card__price') as HTMLElement).textContent =
      typeof product.price === 'number' ? `${product.price} синапсов` : String(product.price);

    const img = card.querySelector('.card__image') as HTMLImageElement | null;
    if (img) {
      img.src = `${CDN_URL}/${product.image}`;
      img.alt = product.title;
    }
    const catEl = card.querySelector('.card__category') as HTMLElement;
if (catEl) {
  catEl.textContent = product.category;

  // снять прошлые модификаторы (на всякий случай)
  const mods = [
    'card__category_soft',
    'card__category_hard',
    'card__category_other',
    'card__category_additional',
    'card__category_button',
  ];
  catEl.classList.remove(...mods);

  // берем тип из product.categoryType (есть в вашем IProduct)
  const type = (product as any).categoryType as
    | 'soft' | 'hard' | 'other' | 'additional' | 'button' | undefined;

  if (type) catEl.classList.add(`card__category_${type}`);
}

    const button = card.querySelector('.button') as HTMLButtonElement;
    const sync = () => {
      button.textContent = inCart ? 'Удалить из корзины' : 'В корзину';
      button.disabled = typeof product.price !== 'number';
    };
    sync();

    button.addEventListener('click', () => {
      if (inCart) {
        this.events.emit('cart:remove', { id: product.id });
        inCart = false;
      } else {
        this.events.emit('cart:add', {
          id: product.id,
          title: product.title,
          price: typeof product.price === 'number' ? product.price : 0,
          quantity: 1,
        });
        inCart = true;
      }
      sync();
    });

    return card;
  }
}

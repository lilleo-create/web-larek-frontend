import { EventEmitter } from '../base/events';
import { CDN_URL } from '../../utils/constants';
import { IProduct } from '../../types';
import { CartModel } from '../../models/CartModel';
import { templatePreview } from '../base/dom';
const CATEGORY_CLASS: Record<string, string> = {
  'софт-скил': 'card__category_soft',
  'хард-скил': 'card__category_hard',
  'дополнительное': 'card__category_additional',
  'кнопка': 'card__category_button',
  'другое': 'card__category_other',
};

function applyCategory(el: HTMLElement, value: string) {
  [...el.classList].forEach((c) => {
    if (c.startsWith('card__category_')) el.classList.remove(c);
  });
  el.textContent = value ?? '';
  const key = (value ?? '').toLowerCase();
  el.classList.add(CATEGORY_CLASS[key] ?? 'card__category_other');
}

export class CardPreviewView {
  private root!: HTMLElement;
  private btn!: HTMLButtonElement;
  private inCart = false;

  constructor(
    private product: IProduct,
    private cartModel: CartModel,
    private events: EventEmitter
  ) { }

  private isInCart(id: string): boolean {
    const m: any = this.cartModel as any;
    const items = typeof m.getItems === 'function' ? m.getItems() : (Array.isArray(m.items) ? m.items : []);
    return items.some((it: any) => it?.id === id);
  }

  private setButtonState(inCart: boolean) {
    this.inCart = inCart;
    if (!this.btn) return;
    this.btn.disabled = false; // не блокируем кнопку
    this.btn.textContent = inCart ? 'Удалить из корзины' : 'В корзину';
  }

  public render(): HTMLElement {
    const frag = templatePreview.content.cloneNode(true) as DocumentFragment;
    const root = frag.querySelector('.card.card_full') as HTMLElement;
    if (!root) throw new Error('Preview root (.card_full) not found');

    const img = root.querySelector<HTMLImageElement>('.card__image');
    const cat = root.querySelector<HTMLElement>('.card__category');
    const title = root.querySelector<HTMLElement>('.card__title');
    const text = root.querySelector<HTMLElement>('.card__text');
    const price = root.querySelector<HTMLElement>('.card__price');
    const btn = root.querySelector<HTMLButtonElement>('.card__button');

    if (!btn || !title || !price) throw new Error('Preview template missing required elements');

    title.textContent = this.product.title;
    if (typeof (this.product as any).description === 'string') {
      if (text) text.textContent = (this.product as any).description;
    }
    if (cat) applyCategory(cat, (this.product as any).category ?? '');
    if (img) {
      img.src = `${CDN_URL}/${this.product.image}`;
      img.alt = this.product.title;
    }
    price.textContent = typeof this.product.price === 'number' ? `${this.product.price} синапсов` : '—';

    this.root = root;
    this.btn = btn;

    this.setButtonState(this.isInCart(this.product.id));

    this.btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const m: any = this.cartModel as any;

      if (this.inCart) {
        m.remove?.(this.product.id);
        this.setButtonState(false);
      } else {
        m.add?.({
          id: this.product.id,
          title: this.product.title,
          price: typeof this.product.price === 'number' ? this.product.price : 0,
        });
        this.setButtonState(true);
      }

      this.events.emit('cart:changed', {});
    });

    return this.root;
  }
}

export default CardPreviewView;

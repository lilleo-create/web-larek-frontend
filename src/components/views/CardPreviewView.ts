import { EventEmitter } from '../base/events';
import { CDN_URL } from '../../utils/constants';
import { IProduct } from '../../types';
import { CartModel } from '../../models/CartModel';
import { templatePreview } from '../base/dom';

export class CardPreviewView {
  private root!: HTMLElement;
  private btn!: HTMLButtonElement;
  private inCart = false;

  constructor(
    private product: IProduct,
    private cartModel: CartModel,
    private events: EventEmitter
  ) {}

  // === helpers ===
  private isPriceless(): boolean {
    const v = (this.product as any).price;
    if (typeof v === 'string') return v.trim().toLowerCase() === 'бесценно';
    return v === 0 || v === null || v === undefined;
  }

  private isUnavailable(): boolean {
    return Boolean((this.product as any).disabled) || this.isPriceless();
  }

  private isInCart(id: string): boolean {
    const m: any = this.cartModel as any;
    const items = typeof m.getItems === 'function' ? m.getItems() : (Array.isArray(m.items) ? m.items : []);
    return items.some((it: any) => it?.id === id);
  }

  private applyCategory(el: HTMLElement, text: string, type?: string) {
    [...el.classList].forEach((c) => c.startsWith('card__category_') && el.classList.remove(c));
    el.textContent = text ?? '';
    const t = (type ?? 'other').toLowerCase();
    el.classList.add(`card__category_${t}`);
  }

  private emitQuietCartUpdate() {
    const m: any = this.cartModel as any;
    const items = typeof m.getItems === 'function' ? m.getItems() : (Array.isArray(m.items) ? m.items : []);
    const count = items.length;
    const total = items.reduce((s: number, it: any) => s + (Number(it?.price) || 0), 0);
    this.events.emit('cart:updated:quiet', { count, total });
  }

  
  private setButtonState(inCart: boolean) {
    this.inCart = inCart;
    if (!this.btn) return;

    if (this.isUnavailable()) {
      this.btn.textContent = 'Недоступно';
      this.btn.classList.add('button_disabled');
      this.btn.setAttribute('aria-disabled', 'true');
      this.btn.disabled = true;
      return;
    }

    this.btn.classList.remove('button_disabled');
    this.btn.removeAttribute('aria-disabled');
    this.btn.disabled = false;
    this.btn.textContent = inCart ? 'Удалить из корзины' : 'В корзину';
  }

  // === render ===
  public render(): HTMLElement {
    const frag = templatePreview.content.cloneNode(true) as DocumentFragment;
    const root = frag.querySelector('.card.card_full') as HTMLElement;
    if (!root) throw new Error('Preview root (.card_full) not found');

    const img   = root.querySelector<HTMLImageElement>('.card__image');
    const catEl = root.querySelector<HTMLElement>('.card__category');
    const title = root.querySelector<HTMLElement>('.card__title');
    const text  = root.querySelector<HTMLElement>('.card__text');
    const price = root.querySelector<HTMLElement>('.card__price');
    const btn   = root.querySelector<HTMLButtonElement>('.card__button');
    if (!btn || !title || !price) throw new Error('Preview template missing required elements');

    // данные
    title.textContent = this.product.title;
    if (typeof (this.product as any).description === 'string') {
      if (text) text.textContent = (this.product as any).description;
    }
    if (catEl) this.applyCategory(catEl, (this.product as any).category ?? '', (this.product as any).categoryType ?? 'other');
    if (img) {
      img.src = `${CDN_URL}/${this.product.image}`;
      img.alt = this.product.title;
    }

    // цена
    if (this.isPriceless()) {
      price.textContent = 'бесценно';
    } else if (typeof this.product.price === 'number' && this.product.price > 0) {
      price.textContent = `${this.product.price} синапсов`;
    } else if (typeof this.product.price === 'string') {
      // если вдруг пришла строка, показываем как есть
      price.textContent = this.product.price;
    } else {
      price.textContent = '—';
    }

    // кнопка
    this.root = root;
    this.btn = btn;

    this.setButtonState(this.isInCart(this.product.id));

    this.btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // защита: «бесценно»/disabled — не покупаем
      if (this.isUnavailable()) return;

      const m: any = this.cartModel as any;
      if (this.inCart) {
        m.remove?.(this.product.id);
        this.setButtonState(false);
        this.emitQuietCartUpdate();
      } else {
        m.add?.({
          id: this.product.id,
          title: this.product.title,
          price: typeof this.product.price === 'number' ? this.product.price : 0,
        });
        this.setButtonState(true);
        this.emitQuietCartUpdate();
      }
    });
    

    return this.root;
  }
  
}

export default CardPreviewView;

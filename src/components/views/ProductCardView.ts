import { IProduct } from '../../types';
import { EventEmitter } from '../base/events';
import { CDN_URL } from '../../utils/constants';

export class ProductCardView extends EventEmitter {
  public product: IProduct;
  private element: HTMLElement;
  private buyBtn?: HTMLButtonElement | HTMLAnchorElement;

  constructor(template: HTMLTemplateElement, product: IProduct) {
    super();
    this.product = product;

    const clone = template.content.cloneNode(true) as DocumentFragment;
    const element = clone.querySelector('.card') as HTMLElement;
    if (!element) {
      throw new Error('[ProductCardView] Элемент .card не найден в шаблоне!');
    }
    this.element = element;

    // Узлы
    const titleEl = this.element.querySelector('.card__title') as HTMLElement | null;
    const priceEl = this.element.querySelector('.card__price') as HTMLElement | null;
    const categoryEl = this.element.querySelector('.card__category') as HTMLElement | null;
    const imgEl = this.element.querySelector('.card__image') as HTMLImageElement | null;

    // Данные
    titleEl && (titleEl.textContent = product.title);

    const isPriceless = product.price === 'бесценно';
    if (priceEl) {
      priceEl.textContent =
        typeof product.price === 'number' ? `${product.price} синапсов` : 'бесценно';
    }

    if (categoryEl) {
      categoryEl.textContent = product.category ?? 'unknown';
      categoryEl.classList.add(`card__category_${(product as any).categoryType ?? 'unknown'}`);
    }

    if (imgEl) {
      imgEl.src = `${CDN_URL}/${product.image}`;
      imgEl.alt = product.title;
    }

    // Кнопка «Купить»
    this.buyBtn =
      (this.element.querySelector('[data-role="buy"]') as HTMLButtonElement | HTMLAnchorElement) ||
      (this.element.querySelector('.card__button') as HTMLButtonElement | HTMLAnchorElement) ||
      (this.element.querySelector('button, a') as HTMLButtonElement | HTMLAnchorElement) ||
      undefined;

    if (this.buyBtn) {
      if (this.buyBtn instanceof HTMLButtonElement) {
        this.buyBtn.type = 'button';
      }

      if (isPriceless) {
        this.setUnavailableState();
      } else {
        this.setBuyState();
      }

      this.buyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.product.price === 'бесценно') return; // защита
        this.emit('buy', { id: this.product.id });
      });
    }

    // Клик по карточке
    this.element.addEventListener('click', () => {
      this.emit('click', { id: this.product.id });
    });
  }

  public setInCart(inCart: boolean) {
    if (!this.buyBtn) return;

    // Для «бесценно» всегда недоступно
    if (this.product.price === 'бесценно') {
      this.setUnavailableState();
      return;
    }

    if (inCart) {
      this.buyBtn.textContent = 'В корзине';
      (this.buyBtn as HTMLButtonElement).disabled = true;
      this.buyBtn.classList.add('is-in-cart');
      this.buyBtn.removeAttribute('aria-disabled');
    } else {
      this.setBuyState();
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  // ===== внутренние утилиты состояния кнопки =====

  private setUnavailableState() {
    if (!this.buyBtn) return;
    this.buyBtn.textContent = 'Недоступно';
    this.buyBtn.classList.add('button_disabled');
    this.buyBtn.setAttribute('aria-disabled', 'true');
    if (this.buyBtn instanceof HTMLButtonElement) {
      this.buyBtn.disabled = true;
    }
  }

  private setBuyState() {
    if (!this.buyBtn) return;
    this.buyBtn.textContent = 'Купить';
    this.buyBtn.classList.remove('button_disabled', 'is-in-cart');
    this.buyBtn.removeAttribute('aria-disabled');
    if (this.buyBtn instanceof HTMLButtonElement) {
      this.buyBtn.disabled = false;
    }
  }
}

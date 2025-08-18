// components/views/HeaderView.ts
import { EventEmitter } from '../base/events';

export default class HeaderView {
  private root: HTMLElement | null;
  private basketBtn: HTMLElement | null;
  private counterEl: HTMLElement | null;

  constructor(private rootSelector: string, private events: EventEmitter) {
    this.root = document.querySelector(this.rootSelector);
    if (!this.root) throw new Error(`Header root "${rootSelector}" not found`);

    this.basketBtn = this.root.querySelector('.header__basket');
    if (!this.basketBtn) throw new Error('Header basket button (.header__basket) not found');

    this.counterEl = this.root.querySelector('.header__basket-counter');

    // Клик по корзине -> событие на шину
    this.basketBtn.addEventListener('click', () => {
      // передаём пустой объект, т.к. EventEmitter ожидает payload типа object
      this.events.emit('cart:open', {});
    });
  }

  setCartCount(count: number) {
    if (!this.counterEl) return;
    this.counterEl.textContent = String(count);
  }
}

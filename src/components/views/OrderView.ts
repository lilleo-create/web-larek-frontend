// src/components/views/OrderView.ts
import { IUserData } from '../../types';
import { EventEmitter } from '../base/events';

export type OrderValidationResult = {
  ok: boolean;
  addressOk: boolean;
  paymentOk: boolean;
  addressError?: string;
  paymentError?: string;
  errors?: string;
};

export class OrderView {
  private root: HTMLElement;
  private form: HTMLFormElement;

  private addressInput: HTMLInputElement | HTMLTextAreaElement;
  private paymentInput: HTMLInputElement | null; // если храните значение в hidden/radio
  private onlineButton: HTMLButtonElement | null;
  private cashButton: HTMLButtonElement | null;
  private nextButton: HTMLButtonElement | null;

  private addressErrorEl: HTMLElement | null;
  private paymentErrorEl: HTMLElement | null;

  private addressFieldEl: HTMLElement;
  private paymentGroupEl: HTMLElement;

  private emitter = new EventEmitter();

  constructor(rootSelector = '#order') {
    const root = document.querySelector(rootSelector);
    if (!root) throw new Error(`OrderView: root ${rootSelector} not found`);
    this.root = root as HTMLElement;

    this.form = (this.root.matches('form') ? this.root : this.root.querySelector('form')) as HTMLFormElement;
    if (!this.form) throw new Error('OrderView: form not found');

    // Поля
    this.addressInput =
      (this.form.querySelector('[name="address"]') as HTMLInputElement | HTMLTextAreaElement) ||
      (() => {
        throw new Error('OrderView: [name="address"] not found');
      })();

    // Может быть hidden input для оплаты или радиокнопки
    this.paymentInput =
      (this.form.querySelector('input[name="payment"][type="hidden"]') as HTMLInputElement) ||
      null;

    // Кнопки выбора оплаты (если используются)
    this.onlineButton = (
      (this.form.querySelector('button[data-payment="online"]') as HTMLButtonElement) ||
      (this.form.querySelector('button[name="online"]') as HTMLButtonElement)
    ) || null;

    this.cashButton = (
      (this.form.querySelector('button[data-payment="cash"]') as HTMLButtonElement) ||
      (this.form.querySelector('button[name="cash"]') as HTMLButtonElement)
    ) || null;

    // Кнопка «далее/оформить»
    this.nextButton = (this.form.querySelector('[type="submit"]') as HTMLButtonElement) || null;

    // Ошибки: поддержим несколько вариантов разметки
    this.addressErrorEl =
      (this.form.querySelector('[data-error-for="address"]') as HTMLElement) ||
      (this.form.querySelector('[data-error="address"]') as HTMLElement) ||
      (this.form.querySelector('#address-error') as HTMLElement) ||
      null;

    this.paymentErrorEl =
      (this.form.querySelector('[data-error-for="payment"]') as HTMLElement) ||
      (this.form.querySelector('[data-error="payment"]') as HTMLElement) ||
      (this.form.querySelector('#payment-error') as HTMLElement) ||
      null;

    // Контейнеры для подсветки
    this.addressFieldEl =
      (this.addressInput.closest('.form__field') as HTMLElement) ||
      (this.addressInput.parentElement as HTMLElement) ||
      this.form;

    const paymentAnchor =
      (this.paymentInput?.closest?.('.form__field') as HTMLElement) ||
      (this.onlineButton?.parentElement as HTMLElement) ||
      (this.cashButton?.parentElement as HTMLElement) ||
      this.form;

      
    this.paymentGroupEl = paymentAnchor;

    this.bindDomEvents();
  }

  // === Публичное API ===

  getOrderData(): Pick<IUserData, 'address' | 'payment'> {
    return {
      address: String((this.addressInput as HTMLInputElement).value ?? '').trim(),
      payment: this.getPayment(),
    };
  }

  setOrderData(data: Partial<IUserData>) {
    if (typeof data.address === 'string') {
      (this.addressInput as HTMLInputElement).value = data.address;
    }
    if (typeof data.payment === 'string' && data.payment) {
      this.setPayment(data.payment);
    }
  }

  showOrderErrors(res: OrderValidationResult) {
    // Адрес
    if (this.addressErrorEl) this.addressErrorEl.textContent = res.addressError || '';
    this.toggleInvalid(this.addressFieldEl, !res.addressOk);

    // Оплата
    if (this.paymentErrorEl) this.paymentErrorEl.textContent = res.paymentError || '';
    this.toggleInvalid(this.paymentGroupEl, !res.paymentOk);

    // Визуально подсветим активную оплату
    if (res.paymentOk) this.setActivePayment(this.getPayment() === 'online' ? 'online' : 'cash');
  }

  clearOrderErrors() {
    if (this.addressErrorEl) this.addressErrorEl.textContent = '';
    if (this.paymentErrorEl) this.paymentErrorEl.textContent = '';
    this.toggleInvalid(this.addressFieldEl, false);
    this.toggleInvalid(this.paymentGroupEl, false);
  }

  setNextDisabled(disabled: boolean) {
    if (this.nextButton) this.nextButton.disabled = disabled;
  }

  onChange(handler: (data: Pick<IUserData, 'address' | 'payment'>) => void) {
    this.emitter.on('change', handler);
  }

  onNext(handler: (data: Pick<IUserData, 'address' | 'payment'>) => void) {
    this.emitter.on('next', handler);
  }

  // === Внутреннее ===

  private bindDomEvents() {
    // Ввод адреса
    this.addressInput.addEventListener('input', () => this.emitChange());

    // Клики по кнопкам оплаты
    if (this.onlineButton) {
      this.onlineButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.setPayment('online');
        this.emitChange();
      });
    }
    if (this.cashButton) {
      this.cashButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.setPayment('cash');
        this.emitChange();
      });
    }

    // Сабмит формы
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.emitter.emit('next', this.getOrderData());
    });
  }

  private emitChange() {
    this.emitter.emit('change', this.getOrderData());
  }

  private getPayment(): 'online' | 'cash' | '' {
    // приоритет — значение в скрытом инпуте, иначе — по активной кнопке
    const fromHidden = this.paymentInput?.value ?? '';
    if (fromHidden === 'online' || fromHidden === 'cash') return fromHidden as 'online' | 'cash';

    if (this.onlineButton?.classList.contains('button_alt-active')) return 'online';
    if (this.cashButton?.classList.contains('button_alt-active')) return 'cash';
    return '';
  }

  private setPayment(type: 'online' | 'cash') {
    if (this.paymentInput) this.paymentInput.value = type;
    this.setActivePayment(type);
  }

  private toggleInvalid(el: HTMLElement | null, invalid: boolean) {
    if (!el) return;
    el.classList.toggle('is-invalid', invalid);
    // если рядом есть error-box — покажем/скроем по наличию текста
    const err = (el.querySelector('.form__error') || el.querySelector('[data-error]')) as HTMLElement | null;
    if (err) err.hidden = !invalid && !err.textContent;
  }

  private setActivePayment(type: 'online' | 'cash') {
    const cls = 'button_alt-active';
    if (this.onlineButton) {
      this.onlineButton.classList.toggle(cls, type === 'online');
      this.onlineButton.setAttribute('aria-pressed', String(type === 'online'));
    }
    if (this.cashButton) {
      this.cashButton.classList.toggle(cls, type === 'cash');
      this.cashButton.setAttribute('aria-pressed', String(type === 'cash'));
    }
  }
}

export default OrderView;

import type { OrderValidationResult } from '../../models/UserModel';

type Payment = 'card' | 'cash';
type PaymentMaybe = Payment | '';

type OrderErrors = Partial<Record<'address' | 'payment', string>>;
export interface Dummy { ok: boolean; errors: OrderErrors; }

export default class OrderView {
  private form!: HTMLFormElement;

  private addressInput!: HTMLInputElement;
  private paymentInput!: HTMLInputElement;

  private btnOnline!: HTMLButtonElement | null;
  private btnCash!: HTMLButtonElement | null;
  private nextBtn!: HTMLButtonElement | null;
  private errorEl!: HTMLElement | null;

  private onChangeHandler?: (data: { address: string; payment: PaymentMaybe }) => void;
  private onNextHandler?: (data: { address: string; payment: PaymentMaybe }) => void;

  constructor(selector = '#order') {
    const root = document.querySelector(selector);
    if (!root) throw new Error(`OrderView: root not found by selector ${selector}`);

    let form: HTMLFormElement | null = null;
    if (root instanceof HTMLTemplateElement) {
      const tplForm = root.content.querySelector('form');
      if (!tplForm) throw new Error('OrderView: form not found in template');
      form = tplForm.cloneNode(true) as HTMLFormElement;
    } else {
      form = (root.matches('form') ? root : root.querySelector('form')) as HTMLFormElement | null;
      if (!form) throw new Error('OrderView: form not found');
    }
    this.form = form;

    this.addressInput = this.form.querySelector('input[name="address"]') as HTMLInputElement;
    this.paymentInput = this.form.querySelector('input[name="payment"]') as HTMLInputElement;

    this.btnOnline = this.form.querySelector<HTMLButtonElement>('button[name="card"]');
    this.btnCash   = this.form.querySelector<HTMLButtonElement>('button[name="cash"]');
    this.nextBtn   = this.form.querySelector<HTMLButtonElement>('[data-next="contacts"]');

    this.errorEl =
      this.form.querySelector<HTMLElement>('.form__errors') ||
      this.form.querySelector<HTMLElement>('.form__error');

    if (!this.addressInput || !this.paymentInput) {
      throw new Error('OrderView: required inputs not found');
    }

    if (!this.errorEl) {
      this.errorEl = document.createElement('span');
      this.errorEl.className = 'form__errors';
      (this.form.querySelector('.modal__actions') ?? this.form).appendChild(this.errorEl);
    }

    if (this.btnOnline) this.btnOnline.type = 'button';
    if (this.btnCash)   this.btnCash.type   = 'button';

    this.updatePaymentButtons();
    this.initListeners();
  }

  render(): HTMLFormElement {
    return this.form;
  }

  onChange(handler: (data: { address: string; payment: PaymentMaybe }) => void): void {
    this.onChangeHandler = handler;
  }

  onNext(handler: (data: { address: string; payment: PaymentMaybe }) => void): void {
    this.onNextHandler = handler;
  }

  getOrderData(): { address: string; payment: PaymentMaybe } {
    return {
      address: (this.addressInput.value ?? '').trim(),
      payment: this.getPayment(),
    };
  }
  showOrderErrors(res: OrderValidationResult): void {
    if (!this.errorEl) return;

    const msg = !res.addressOk
      ? (res.addressError || 'Укажите адрес')
      : (!res.paymentOk ? 'Выберите способ оплаты' : '');

    this.errorEl.textContent = msg;
    this.errorEl.style.display = msg ? 'block' : 'none';
  }

  public setNextDisabled(disabled: boolean): void {
    if (!this.nextBtn) return;
    this.nextBtn.disabled = disabled;
    if (disabled) {
      this.nextBtn.setAttribute('disabled', '');
    } else {
      this.nextBtn.removeAttribute('disabled');
    }
  }
  

  private initListeners(): void {
    this.btnOnline?.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      this.setPayment('card');
      this.updatePaymentButtons();
      this.emitChange();
    });

    this.btnCash?.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      this.setPayment('cash');
      this.updatePaymentButtons();
      this.emitChange();
    });

    this.addressInput.addEventListener('input', () => {
      this.emitChange();
    });

    this.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.onNextHandler?.(this.getOrderData());
    });
  }

  private getPayment(): PaymentMaybe {
    const val = (this.paymentInput.value ?? '').trim();
    return val === 'card' || val === 'cash' ? val : '';
  }

  private setPayment(value: Payment): void {
    this.paymentInput.value = value;
  }

  private updatePaymentButtons(): void {
    const current = this.getPayment();
    this.btnOnline?.classList.toggle('button_alt-active', current === 'card');
    this.btnCash?.classList.toggle('button_alt-active', current === 'cash');
  }

  private emitChange(): void {
    const data = this.getOrderData();
    this.onChangeHandler?.(data);
  }
}

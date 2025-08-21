import type { OrderValidationResult } from '../../models/UserModel';

type Payment = 'online' | 'cash';
type PaymentMaybe = Payment | '';

export default class OrderView {
  private form!: HTMLFormElement;

  private addressInput!: HTMLInputElement;
  private paymentInput!: HTMLInputElement;

  private btnOnline!: HTMLButtonElement | null;
  private btnCash!: HTMLButtonElement | null;
  private nextBtn!: HTMLButtonElement | null;
  private errorEl!: HTMLElement | null;
  

  private touched = { address: false, payment: false, submitted: false };

  private onChangeHandler?: (data: { address: string; payment: PaymentMaybe }) => void;
  private onNextHandler?: (data: { address: string; payment: PaymentMaybe }) => void;

  constructor(selector = '#order') {
    const root = document.querySelector(selector);
    if (!root) throw new Error(`OrderView: root not found by selector ${selector}`);

    if (root instanceof HTMLTemplateElement) {
      const tplForm = root.content.querySelector('form');
      if (!tplForm) throw new Error('OrderView: form not found in template');
      this.form = tplForm.cloneNode(true) as HTMLFormElement;
    } else {
      const maybeForm = root.matches('form') ? root : root.querySelector('form');
      if (!maybeForm) throw new Error('OrderView: form not found');
      this.form = maybeForm as HTMLFormElement;
    }

    this.addressInput = this.form.querySelector('input[name="address"]') as HTMLInputElement;
    this.paymentInput = this.form.querySelector('input[name="payment"]') as HTMLInputElement;
    this.btnOnline = this.form.querySelector<HTMLButtonElement>('button[name="card"]');
    this.btnCash = this.form.querySelector<HTMLButtonElement>('button[name="cash"]');
    this.nextBtn = this.form.querySelector<HTMLButtonElement>('[data-next="contacts"]');
    

    this.errorEl =
      this.form.querySelector<HTMLElement>('.form__errors') ||
      this.form.querySelector<HTMLElement>('.form__error');

    if (!this.addressInput || !this.paymentInput) {
      throw new Error('OrderView: required inputs not found');
    }
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

  const interacted =
    this.touched.address || this.touched.payment || this.touched.submitted;

  if (!interacted) {
    this.errorEl.textContent = '';
    return;
  }
  
  if (!res.addressOk) {
    this.errorEl.textContent = res.addressError || 'Введите адрес';
  } else if (!res.paymentOk) {
    this.errorEl.textContent = 'Выберите способ оплаты';
  } else {
    this.errorEl.textContent = '';
  }

  this.updatePaymentButtons();
}
public setNextDisabled(disabled: boolean): void {
  if (this.nextBtn) this.nextBtn.disabled = disabled;
}

  // ===== внутреннее =====

  private initListeners(): void {
    this.btnOnline?.addEventListener('click', () => {
      this.touched.payment = true;
      this.setPayment('online');
      this.updatePaymentButtons();
      this.emitChange();
    });

    this.btnCash?.addEventListener('click', () => {
      this.touched.payment = true;
      this.setPayment('cash');
      this.updatePaymentButtons();
      this.emitChange();
    });

    this.addressInput.addEventListener('input', () => {
      this.touched.address = true;
      this.emitChange();
    });

    this.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      this.touched.submitted = true;
      const data = this.getOrderData();
      this.onNextHandler?.(data);
    });
  }

  private getPayment(): PaymentMaybe {
    const val = (this.paymentInput.value ?? '').trim();
    if (val === 'online' || val === 'cash') return val;
    return '';
  }

  private setPayment(value: Payment): void {
    this.paymentInput.value = value;
  }

  private updatePaymentButtons(): void {
    const current = this.getPayment();
    this.btnOnline?.classList.toggle('button_alt-active', current === 'online');
    this.btnCash?.classList.toggle('button_alt-active', current === 'cash');
  }

  private emitChange(): void {
    const data = this.getOrderData();
    this.onChangeHandler?.(data);
  }
}

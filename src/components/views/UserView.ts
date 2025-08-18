// src/components/views/UserView.ts
import { IUserData } from '../../types';
import { EventEmitter } from '../base/events';

export class UserView {
  private addressInput: HTMLInputElement;
  private paymentInput: HTMLInputElement;                // скрытый input[name="payment"]
  private nextButton: HTMLButtonElement | null;
  private errorSpan: HTMLElement | null;

  // сами кнопки выбора оплаты
  private onlineButton: HTMLButtonElement | null;
  private cashButton: HTMLButtonElement | null;

  constructor(private form: HTMLFormElement, private events: EventEmitter) {
    // поля формы
    this.addressInput = this.form.querySelector('input[name="address"]') as HTMLInputElement;
    this.paymentInput = this.form.querySelector('input[name="payment"]') as HTMLInputElement;

    this.nextButton = this.form.querySelector('.button[data-next="contacts"]') as HTMLButtonElement | null;
    this.errorSpan = this.form.querySelector('.form__error, .form__errors') as HTMLElement | null;

    // возможные варианты селекторов для кнопок оплаты в разметке
    this.onlineButton = (
      this.form.querySelector('button[data-payment="online"]') ||
      this.form.querySelector('button[name="online"]') ||
      this.form.querySelector('button[name="card"]')
    ) as HTMLButtonElement | null;

    this.cashButton = (
      this.form.querySelector('button[data-payment="cash"]') ||
      this.form.querySelector('button[name="cash"]')
    ) as HTMLButtonElement | null;

    // навешиваем обработчики
    this.bind();
    // первичная инициализация (подсветка уже выбранного значения, если есть)
    this.syncFromInput();
    this.validate();
  }

  /** Текущие значения формы */
  public getData(): Partial<IUserData> {
    return {
      address: this.addressInput?.value?.trim() || '',
      payment: this.paymentInput?.value as 'online' | 'cash' | undefined,
    };
  }

  /** Устанавливаем значения в форму */
  public setData(data: Partial<IUserData>) {
    if (typeof data.address === 'string') this.addressInput.value = data.address;
    if (data.payment === 'online' || data.payment === 'cash') {
      this.setPayment(data.payment);
    }
    this.validate();
  }

  /** Коллбэк на кнопку «Далее» */
  public onNext(callback: () => void) {
    if (!this.nextButton) return;
    this.nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.validate()) callback();
    });
  }

  // ====== внутреннее ======

  private bind() {
    // адрес
    this.addressInput?.addEventListener('input', () => this.validate());

    // оплата — онлайн
    this.onlineButton?.addEventListener('click', (e) => {
      e.preventDefault();
      this.setPayment('online');
      this.validate();
    });

    // оплата — при получении
    this.cashButton?.addEventListener('click', (e) => {
      e.preventDefault();
      this.setPayment('cash');
      this.validate();
    });
  }

  /** выставляем payment и подсветку кнопок */
  private setPayment(type: 'online' | 'cash') {
    if (this.paymentInput) this.paymentInput.value = type;
    this.setActivePayment(type);
  }

  /** читаем payment из скрытого инпута и подсвечиваем кнопки (на случай повторного открытия формы) */
  private syncFromInput() {
    const val = (this.paymentInput?.value as 'online' | 'cash' | '') || '';
    if (val === 'online' || val === 'cash') this.setActivePayment(val);
  }

  /** валидация формы: адрес + выбор оплаты */
  private validate(): boolean {
    const addressOk = !!this.addressInput?.value?.trim();
    const paymentVal = this.paymentInput?.value;
    const paymentOk = paymentVal === 'online' || paymentVal === 'cash';

    const ok = addressOk && paymentOk;

    if (this.nextButton) this.nextButton.disabled = !ok;
    if (this.errorSpan) {
      this.errorSpan.textContent = ok ? '' : (!addressOk ? 'Укажите адрес' : 'Выберите способ оплаты');
    }
    return ok;
  }

  private setActivePayment(type: 'online' | 'cash') {
    // класс подсветки по методичке
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

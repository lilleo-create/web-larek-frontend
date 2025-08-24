// src/components/views/ContactView.ts
import { EventEmitter } from '../base/events';

type ContactErrors = Partial<Record<'email' | 'phone' | 'name', string>>;
type ContactData = { email: string; phone: string; name?: string };

export class ContactView {
  private form: HTMLFormElement;
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;
  private nameInput: HTMLInputElement | null;
  private submitButton: HTMLButtonElement;
  private errorEl: HTMLElement;

  private touched = {
    email: false,
    phone: false,
    name: false,
    submitted: false,
  };

  constructor(form: HTMLFormElement, private events: EventEmitter) {
    this.form = form;

    this.emailInput = this.form.querySelector('input[name="email"]') as HTMLInputElement;
    this.phoneInput = this.form.querySelector('input[name="phone"]') as HTMLInputElement;
    this.nameInput  = this.form.querySelector('input[name="name"]')  as HTMLInputElement | null;
    this.submitButton = (this.form.querySelector('button[type="submit"]') ||
                         this.form.querySelector('button')) as HTMLButtonElement;

    this.errorEl =
      (this.form.querySelector('.form__errors') as HTMLElement) ||
      (this.form.querySelector('.form__error') as HTMLElement) ||
      (() => {
        const span = document.createElement('span');
        span.className = 'form__errors';
        (this.form.querySelector('.modal__actions') ?? this.form).appendChild(span);
        return span;
      })();

    this.errorEl.setAttribute('role', 'alert');
    this.errorEl.setAttribute('aria-live', 'polite');

    // disabled по умолчанию
    this.setSubmitEnabled(false);

    // touched по фокусу
    this.emailInput.addEventListener('focus', () => this.markTouched('email'));
    this.phoneInput.addEventListener('focus', () => this.markTouched('phone'));
    if (this.nameInput) this.nameInput.addEventListener('focus', () => this.markTouched('name'));

    // input -> обновить модель и пересчитать валидацию
    this.emailInput.addEventListener('input', () => { this.markTouched('email'); this.emitChange(); });
    this.phoneInput.addEventListener('input', () => { this.markTouched('phone'); this.emitChange(); });
    if (this.nameInput) this.nameInput.addEventListener('input', () => { this.markTouched('name'); this.emitChange(); });

    // submit -> показываем ошибки даже по нетронутым
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.touched.submitted = true;
      this.events.emit('user:validate:contacts');
    });
  }

  /** Текущие значения; name отправляем только если поле существует */
  getData(): ContactData {
    const email = (this.emailInput.value ?? '').trim();
    const phone = (this.phoneInput.value ?? '').trim();
    if (this.nameInput) {
      const name = (this.nameInput.value ?? '').trim();
      return { email, phone, name };
    }
    return { email, phone };
  }

  /** Включить/выключить submit */
  setSubmitEnabled(enabled: boolean) {
    if (!this.submitButton) return;
    this.submitButton.disabled = !enabled;
    if (enabled) this.submitButton.removeAttribute('disabled');
    else this.submitButton.setAttribute('disabled', '');
  }

  /**
   * Показать ошибки.
   * Рисуем до ДВУХ сообщений в одну строку через `;`,
   * но только для touched-полей или после сабмита.
   */
  showErrors(errors: ContactErrors) {
    const canShow = (f: 'email' | 'phone' | 'name') =>
      this.touched.submitted || this.touched[f];

    const msgs: string[] = [];
    if (canShow('email') && errors.email) msgs.push(errors.email);
    if (canShow('phone') && errors.phone) msgs.push(errors.phone);
    if (canShow('name')  && errors.name)  msgs.push(errors.name);

    const line = msgs.slice(0, 2).join('; ');
    this.errorEl.textContent = line;
    this.errorEl.style.display = line ? 'block' : 'none';
  }

  private markTouched(field: 'email' | 'phone' | 'name') {
    if (!this.touched[field]) this.touched[field] = true;
  }

  /** Сообщаем модели об изменениях */
  private emitChange() {
    const data = this.getData();
    this.events.emit('user:update', data);
    this.events.emit('user:validate:contacts');
  }
}

// UserFormPresenter.ts
import { IUserData } from '../types';
import { EventEmitter } from '../components/base/events';
import { UserView } from '../components/views/UserView';
import Modal from '../components/views/ModalView';
import { SuccessView } from '../components/views/SuccessView';


export class UserFormPresenter {
  constructor(
    private view: UserView,
    private events: EventEmitter,
    private modal: Modal
  ) {
    // order form (первый шаг)
    this.view.setPaymentListeners(() => this.emitFormChange());
    this.view.setAddressInputListener(() => this.emitFormChange());
    this.view.setNextButtonListener(() => this.handleNext());

    // события
    this.events.on('form:change', (data: IUserData) => this.handleFormChange(data));
    this.events.on('form:submit', this.openContactModal.bind(this));
    this.events.on('form:success', this.openSuccessModal.bind(this));
  }

  private emitFormChange() {
    const data = this.view.getData();
    this.events.emit('form:change', data);
  }

  // валидация шага "Заказ" (адрес + выбранный способ)
  private handleFormChange(data: IUserData) {
		const hasAddress = data.address.trim().length > 0;
		const hasPayment = !!data.payment;
		this.view.setButtonDisabled(!(hasAddress && hasPayment));
		this.view.setErrors(hasAddress ? '' : 'Необходимо указать адрес');
	}
  private handleNext() {
    const data = this.view.getData();
    const isValid = data.address.trim().length > 0 && !!data.payment;
    if (isValid) {
      this.events.emit('form:submit');
    }
  }

  // открываем шаг "Контакты" и валидируем email/телефон
  private openContactModal() {
    const template = document.querySelector<HTMLTemplateElement>('#contacts');
    if (!template) throw new Error('Template #contacts not found');

    const content = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const form = content as HTMLFormElement;

    this.modal.setContent(content);
    this.modal.open();

    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const phoneInput = form.elements.namedItem('phone') as HTMLInputElement;
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    const errors = form.querySelector('.form__errors') as HTMLElement | null;

    const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    const isPhone = (v: string) => v.replace(/\D/g, '').length >= 11;

    const validate = () => {
      const okEmail = isEmail(emailInput.value);
      const okPhone = isPhone(phoneInput.value);
      const valid = okEmail && okPhone;
      submitBtn.disabled = !valid;
      if (errors) {
        errors.textContent = valid
          ? ''
          : !okEmail
          ? 'Введите корректный email'
          : 'Введите корректный телефон';
      }
    };

    emailInput.addEventListener('input', validate);
    phoneInput.addEventListener('input', validate);
    validate();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!submitBtn.disabled) this.events.emit('form:success');
    });
  }

  // успех
	private openSuccessModal() {
		const container = document.createElement('div'); // временный контейнер
		const successView = new SuccessView(container);
	
		successView.render('Заказ оформлен', 'Спасибо за покупку!');
	
		container.addEventListener('success:close', () => {
			this.modal.close();
			this.events.emit('cart:clear');
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	
		this.modal.setContent(container);
		this.modal.open();
	}
	
}

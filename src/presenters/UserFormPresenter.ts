import { IUserData } from '../types';
import { EventEmitter } from '../components/base/events';
import { UserView } from '../components/views/UserView';
import Modal from '../components/views/ModalView';
import { SuccessView } from '../components/views/SuccessView';
import { ContactView } from '../components/views/ContactView';
import { UserModel } from '../models/UserModel';

export class UserFormPresenter {
  private userModel = new UserModel();

  constructor(
    private view: UserView,
    private events: EventEmitter,
    private modal: Modal
  ) {
    // Шаг 1: способ оплаты + адрес
    this.view.setPaymentListeners(() => this.emitFormChange());
    this.view.setAddressInputListener(() => this.emitFormChange());
    this.view.setNextButtonListener(() => this.handleNext());

    // Доменные события формы
    this.events.on('form:change', (data: IUserData) => this.handleFormChange(data));
    this.events.on('form:submit', this.openContactModal.bind(this));
    this.events.on('form:success', this.openSuccessModal.bind(this));
  }

  private emitFormChange() {
    const data = this.view.getData();
    this.events.emit('form:change', data);
  }

  // Валидация шага «Заказ» (адрес + выбранный способ) — через модель
  private handleFormChange(data: IUserData) {
    const res = this.userModel.validateOrder(data);
    this.view.setButtonDisabled(!res.ok);
    this.view.setErrors(res.errors);
  }

  private handleNext() {
    const data = this.view.getData();
    const res = this.userModel.validateOrder(data);

    if (!res.ok) {
      this.view.setErrors(res.errors);
      return;
    }
    this.view.setErrors('');
    this.events.emit('form:submit');
  }

  // Шаг 2: контакты — DOM в ContactView, логика валидации в UserModel
  private openContactModal() {
    const contactView = new ContactView('#contacts');
    const formEl = contactView.render();
    this.modal.setContent(formEl);
    this.modal.open();

    const touched = { email: false, phone: false };

    const validate = () => {
      const { email, phone } = contactView.getData();
      const res = this.userModel.validateContacts(email, phone);

      contactView.setSubmitDisabled(!res.ok);

      if (touched.email && !res.emailOk) {
        contactView.setErrors('Введите корректный email');
      } else if (touched.phone && !res.phoneOk) {
        contactView.setErrors('Введите корректный телефон');
      } else {
        contactView.setErrors('');
      }
    };

    contactView.onEmailInput(() => { touched.email = true; validate(); });
    contactView.onPhoneInput(() => { touched.phone = true; validate(); });
    contactView.setSubmitDisabled(true);
    contactView.setErrors('');

    contactView.onSubmit(() => {
      touched.email = true;
      touched.phone = true;
      validate();

      const { email, phone } = contactView.getData();
      const res = this.userModel.validateContacts(email, phone);
      if (!res.ok) return;

      this.events.emit('form:success');
    });
  }

  // Успех — без прямых DOM‑слушателей в презентере
  private openSuccessModal() {
    const container = document.createElement('div');
    const successView = new SuccessView(container);

    successView.render('Заказ оформлен', 'Спасибо за покупку!');

    successView.onClose(() => {
      this.modal.close();
      this.events.emit('cart:clear');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    this.modal.setContent(container);
    this.modal.open();
  }
}

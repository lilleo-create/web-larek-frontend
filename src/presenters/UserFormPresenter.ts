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
    this.view.onNext(() => this.handleNext());
  }

  private handleNext() {
    const data = this.view.getData();
    const res = this.userModel.validateOrder(data as IUserData);
    if (!res.ok) return;

    this.openContactModal();
  }

  // Шаг 2: контакты
  private openContactModal() {
    const contactView = new ContactView('#contacts');
    const formEl = contactView.render();
    this.modal.setContent(formEl);
    this.modal.open();

    let touched = { email: false, phone: false };

    const validate = () => {
      const { email, phone } = contactView.getData();
      const result = this.userModel.validateContacts(email, phone);
      contactView.setSubmitDisabled(!result.ok);

      if (touched.email && !result.emailOk) {
        contactView.setErrors('Введите корректный email');
      } else if (touched.phone && !result.phoneOk) {
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
      touched = { email: true, phone: true };
      validate();

      const { email, phone } = contactView.getData();
      const result = this.userModel.validateContacts(email, phone);
      if (!result.ok) return;

      this.openSuccessModal();
    });
  }

  // Шаг 3: успех
  private openSuccessModal() {
    const container = document.createElement('div');
    const successView = new SuccessView(container);
    successView.render('Заказ оформлен', 'Спасибо за покупку!');

    successView.onClose(() => {
      this.modal.close();
      this.events.emit('cart:clear');
      this.events.emit('ui:scrollTop');
    });

    this.modal.setContent(container);
    this.modal.open();
  }
}

export default UserFormPresenter;

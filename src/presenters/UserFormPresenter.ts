import { IUserData } from '../types';
import { EventEmitter } from '../components/base/events';
import OrderView from '../components/views/OrderView';
import Modal from '../components/views/ModalView';
import { SuccessView } from '../components/views/SuccessView';
import { ContactView } from '../components/views/ContactView';
import UserModel from '../models/UserModel';

export class UserFormPresenter {
  private userModel = new UserModel();

  constructor(
    private view: OrderView,
    private events: EventEmitter,
    private modal: Modal
  ) {
    // Шаг 1: адрес + оплата — подписки НЕ через events, а напрямую на OrderView
    this.view.onChange((data: Pick<IUserData, 'address' | 'payment'>) => {
      const res = this.userModel.validateOrder(data as IUserData);
      this.view.showOrderErrors(res);
      this.view.setNextDisabled(!res.ok);
    });

    this.view.onNext((data: Pick<IUserData, 'address' | 'payment'>) => {
      const res = this.userModel.validateOrder(data as IUserData);
      this.view.showOrderErrors(res);
      if (!res.ok) return;
      this.openContactModal();
    });

    // Инициализация состояния формы шага 1
    const initData = this.view.getOrderData();
    const initRes = this.userModel.validateOrder(initData as IUserData);
    this.view.showOrderErrors(initRes);
    this.view.setNextDisabled(!initRes.ok);
  }

  // Шаг 2: контакты
  private openContactModal() {
    const contactView = new ContactView('#contacts');
    const formEl = contactView.render();
    this.modal.setContent(formEl);
    this.modal.open();

    const applyContactsValidation = () => {
      const { email, phone } = contactView.getData();
      const result = this.userModel.validateContacts(email, phone);
      contactView.setErrors(result.errorText || '');
      contactView.setSubmitDisabled(!result.ok);
    };

    // У этих методов должен быть РОВНО один аргумент — handler
    contactView.onEmailInput(applyContactsValidation);
    contactView.onPhoneInput(applyContactsValidation);

    // Инициализация
    contactView.setSubmitDisabled(true);
    contactView.setErrors('');
    applyContactsValidation();

    contactView.onSubmit(() => {
      applyContactsValidation();
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

    successView.onClose((): void => {
      this.modal.close();
      this.events.emit('cart:clear');
      this.events.emit('ui:scrollTop');
    });

    this.modal.setContent(container);
    this.modal.open();
  }
}

export default UserFormPresenter;

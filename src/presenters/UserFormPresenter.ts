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
    this.view.onChange((data) => {
      const res = this.userModel.validateOrder(data as IUserData);
      this.view.showOrderErrors(res);
      this.view.setNextDisabled(!res.ok);
    });
    
    this.view.onNext((data) => {
      const res = this.userModel.validateOrder(data as IUserData);
      this.view.showOrderErrors(res);
      if (!res.ok) return;
      this.openContactModal();
    });
    this.view.setNextDisabled(true);
    const initData = this.view.getOrderData();
    const initRes = this.userModel.validateOrder(initData as IUserData);
    this.view.showOrderErrors(initRes);
    this.view.setNextDisabled(!initRes.ok);
  }

  private openContactModal() {
    const contactView = new ContactView('#contacts');
    const formEl = contactView.render();
    this.modal.setContent(formEl);
    this.modal.open();
  
    let touchedEmail = false;
    let touchedPhone = false;
    let submitted = false;
  
    const validateAndRender = (opts: { forceShow?: boolean } = {}) => {
      const { email, phone } = contactView.getData();
      const result = this.userModel.validateContacts({ email, phone });
      const shouldShow = opts.forceShow || submitted || touchedEmail || touchedPhone;

      const messages: string[] = [];
      if (result.errors.email) messages.push(result.errors.email);
      if (result.errors.phone) messages.push(result.errors.phone);

      const errorText = shouldShow ? messages.join('; ') : '';
      contactView.setErrors(errorText);
      contactView.setSubmitDisabled(!result.valid);
  
      return result.valid;
    };

    contactView.setSubmitDisabled(true);
    contactView.setErrors('');
    validateAndRender();
    contactView.onEmailInput(() => {
      touchedEmail = true;
      validateAndRender();
    });
  
    contactView.onPhoneInput(() => {
      touchedPhone = true;
      validateAndRender();
    });

    contactView.onSubmit(() => {
      submitted = true;
      const ok = validateAndRender({ forceShow: true });
      if (!ok) return;
  
      this.openSuccessModal();
    });
  }

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

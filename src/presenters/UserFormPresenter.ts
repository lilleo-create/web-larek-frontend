import { IUserData } from '../types';
import { EventEmitter } from '../components/base/events';
import { UserView } from '../components/views/UserView';
import Modal from '../components/views/ModalView';
import { orderButton } from '../components/base/dom';

export class UserFormPresenter {
  constructor(
    private view: UserView,
    private events: EventEmitter,
    private modal: Modal
  ) {
    this.view.setPaymentListeners(() => this.emitFormChange());
    this.view.setAddressInputListener(() => this.emitFormChange());
    this.view.setNextButtonListener(() => this.handleNext());

    orderButton.addEventListener('click', () => {
      this.events.emit('form:order');
    });

    this.events.on('form:change', this.handleFormChange.bind(this));
    this.events.on('form:order', this.openOrderModal.bind(this));
    this.events.on('form:submit', this.openContactModal.bind(this));
    this.events.on('form:success', this.openSuccessModal.bind(this));
  }

  private emitFormChange() {
    const data = this.view.getData();
    this.events.emit('form:change', data);
  }

  private handleFormChange(data: IUserData) {
    const isValid = data.address.trim().length > 0 && !!data.payment;
    this.view.setButtonDisabled(!isValid);
    this.view.setErrors(isValid ? '' : 'Необходимо указать адрес');
  }

  private handleNext() {
    const data = this.view.getData();
    const isValid = data.address.trim().length > 0 && !!data.payment;
    if (isValid) {
      this.events.emit('form:submit');
    }
  }

  private openOrderModal() {
    const el = document.getElementById('modal-order');
    if (!el) return;
    const content = el.querySelector('.modal__content') as HTMLElement;
    this.modal.setContent(content);
    this.modal.open();
  }

  private openContactModal() {
    const el = document.getElementById('modal-contacts');
    if (!el) return;
    const content = el.querySelector('.modal__content') as HTMLElement;
    this.modal.setContent(content);
    this.modal.open();
  }

  private openSuccessModal() {
    const el = document.getElementById('modal-success');
    if (!el) return;

    const content = el.querySelector('.modal__content') as HTMLElement;
    this.modal.setContent(content);
    this.modal.open();

    const closeBtn = el.querySelector('.modal__close') as HTMLButtonElement;
    closeBtn?.addEventListener('click', () => {
      this.modal.close();
    });
  }
}

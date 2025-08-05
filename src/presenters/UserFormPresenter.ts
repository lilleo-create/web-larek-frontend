import { IUserData } from '../types/user';
import { IOrder } from '../types/api';
import { EventEmitter } from '../components/base/events';
import { UserView } from '../components/views/UserView';
import {Modal} from '../components/views/ModalView';
import { Api } from '../components/base/api';
import { CartModel } from '../models/CartModel';

export class UserFormPresenter {
	constructor(
		private view: UserView,
		private events: EventEmitter,
		private modal: Modal,
		private api: Api,
		private cartModel: CartModel
	) {
		this.view.setPaymentListeners(() => this.emitFormChange());
		this.view.setAddressInputListener(() => this.emitFormChange());
		this.view.setNextButtonListener(() => this.handleNext());
		this.view.setContactInputListeners(() => this.emitContactFormChange());
		this.view.setContactButtonListener(() => this.handleSubmit());

		this.events.on('form:change', this.handleFormChange.bind(this));
		this.events.on('form:order', this.openOrderModal.bind(this));
		this.events.on('form:submit', this.openContactModal.bind(this));
		this.events.on('form:success', this.openSuccessModal.bind(this));
	}

	private emitContactFormChange() {
		const data = this.view.getContactData();
		const isValid = this.validateContact(data);
		this.view.setContactButtonDisabled(!isValid);
		this.view.setContactErrors(isValid ? '' : 'Введите корректные данные');
	}

	private validateContact(data: { email: string; phone: string }) {
		const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
		const phoneValid = /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/.test(data.phone.trim());
		return emailValid && phoneValid;
	}

	private handleSubmit() {
		const contact = this.view.getContactData();
		if (!this.validateContact(contact)) return;

		const user = this.view.getData();
		const items = this.cartModel.getItems().map(item => item.id);

		const order: IOrder = {
			payment: user.payment,
			address: user.address,
			email: contact.email,
			phone: contact.phone,
			items
		};

		this.api.orderProducts(order).then(() => {
			this.events.emit('cart:clear');
			this.events.emit('form:success');
		}).catch((error: unknown) => {
			console.error('[Order failed]', error);
			this.view.setContactErrors('Ошибка отправки заказа');
		});
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

		this.view.setContactInputListeners(() => this.emitContactFormChange());
		this.view.setContactButtonListener(() => this.handleSubmit());
	}

	private openSuccessModal() {
		const template = document.getElementById('success') as HTMLTemplateElement;
		if (!template) return;

		const clone = template.content.cloneNode(true) as DocumentFragment;
		const successEl = clone.querySelector('.order-success') as HTMLElement;

		this.modal.setContent(successEl);
		this.modal.open();

		const goBackBtn = successEl.querySelector('.order-success__close') as HTMLButtonElement;
		goBackBtn?.addEventListener('click', () => {
			this.modal.close();
		});
	}
}

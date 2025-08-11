import { IUserData } from '../../types';
import { EventEmitter } from '../base/events';

export class UserView {
	private addressInput: HTMLInputElement;
	private paymentInput: HTMLInputElement;
	private nextButton: HTMLButtonElement;
	private errorSpan: HTMLElement;
	private onlineButton: HTMLButtonElement;
	private cashButton: HTMLButtonElement;

	constructor(private form: HTMLFormElement, private events: EventEmitter) {
		this.addressInput = this.form.querySelector('input[name="address"]');
		this.paymentInput = this.form.querySelector('input[name="payment"]');
		this.nextButton = this.form.querySelector('.button[data-next="contacts"]') ?? null;
		this.errorSpan = this.form.querySelector('.form__error, .form__errors')!;
	
		this.onlineButton = this.form.querySelector('button[name="card"]');
		this.cashButton = this.form.querySelector('button[name="cash"]');
	}
	
	public getData(): IUserData {
		return {
			address: this.addressInput.value.trim(),
			payment: this.paymentInput.value as 'online' | 'cash',
			email: '',
			phone: '',
		};
	}

	public setButtonDisabled(value: boolean) {
		this.nextButton.disabled = value;
	}

	public setErrors(error: string) {
		this.errorSpan.textContent = error;
	}

	public setPaymentListeners(callback: () => void) {
		if (!this.onlineButton || !this.cashButton || !this.paymentInput) return;
	
		this.onlineButton.addEventListener('click', () => {
			this.setActivePayment('online');
			this.paymentInput!.value = 'online';
			callback();
		});
		this.cashButton.addEventListener('click', () => {
			this.setActivePayment('cash');
			this.paymentInput!.value = 'cash';
			callback();
		});
	}

	public setAddressInputListener(callback: () => void) {
		if (!this.addressInput) return;
		this.addressInput.addEventListener('input', () => {
			console.log('[input] address changed:', this.addressInput.value);
			callback();
		});
	}

	public setNextButtonListener(callback: () => void) {
		const nextButton = this.form.querySelector<HTMLButtonElement>('.button[data-next="contacts"]');
		if (!nextButton) return;
	
		nextButton.addEventListener('click', (e) => {
			e.preventDefault();
			callback();
		});
	}
	
	private setActivePayment(type: 'online' | 'cash') {
		this.onlineButton.classList.toggle('button_alt-active', type === 'online');
		this.cashButton.classList.toggle('button_alt-active', type === 'cash');
	}
}

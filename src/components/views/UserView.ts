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
		this.addressInput = this.form.querySelector('input[name="address"]')!;
		this.paymentInput = this.form.querySelector('input[name="payment"]')!;
		this.nextButton = this.form.querySelector('.button[data-next="contacts"]')!;
		this.errorSpan = this.form.querySelector('.form__error')!;
		this.onlineButton = this.form.querySelector('button[name="card"]')!;
		this.cashButton = this.form.querySelector('button[name="cash"]')!;
	}

	getData(): IUserData {
		return {
			address: this.addressInput.value,
			payment: this.getSelectedPayment()
		};
	}
	

	public setButtonDisabled(value: boolean) {
		this.nextButton.disabled = value;
	}

	public setErrors(error: string) {
		this.errorSpan.textContent = error;
	}

	private getSelectedPayment(): 'online' | 'cash' {
		return this.paymentInput.value === 'online' ? 'online' : 'cash';
	}
	

	public setPaymentListeners(callback: () => void) {
		this.onlineButton.addEventListener('click', () => {
			this.setActivePayment('online');
			this.paymentInput.value = 'online';
			callback();
		});
		this.cashButton.addEventListener('click', () => {
			this.setActivePayment('cash');
			this.paymentInput.value = 'cash';
			callback();
		});
	}

	public setAddressInputListener(callback: () => void) {
		this.addressInput.addEventListener('input', callback);
	}

	public setNextButtonListener(callback: () => void) {
		this.nextButton.addEventListener('click', (e) => {
			e.preventDefault();
			callback();
		});
	}

	public setContactInputListeners(callback: () => void) {
		const email = document.querySelector<HTMLInputElement>('input[name="email"]');
		const phone = document.querySelector<HTMLInputElement>('input[name="phone"]');

		email?.addEventListener('input', callback);

		if (phone) {
			phone.addEventListener('input', () => {
				let digits = phone.value.replace(/\D/g, '').replace(/^8/, '7');

				if (!digits.startsWith('7')) {
					digits = '7' + digits;
				}
				digits = digits.slice(0, 11);

				let formatted = '+7';
				if (digits.length > 1) formatted += ` (${digits.slice(1, 4)}`;
				if (digits.length >= 4) formatted += `) ${digits.slice(4, 7)}`;
				if (digits.length >= 7) formatted += `-${digits.slice(7, 9)}`;
				if (digits.length >= 9) formatted += `-${digits.slice(9, 11)}`;

				phone.value = formatted;
				callback();
			});
		}
	}



	public getContactData(): { email: string; phone: string } {
		const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value || '';
		const phone = (document.querySelector('input[name="phone"]') as HTMLInputElement)?.value || '';
		return { email, phone };
	}

	public setContactButtonListener(callback: () => void) {
		const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
		button?.addEventListener('click', (e) => {
			e.preventDefault();
			callback();
		});
	}

	public setContactButtonDisabled(value: boolean) {
		const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
		if (button) button.disabled = value;
	}

	public setContactErrors(message: string) {
		const error = document.querySelector('.form__errors');
		if (error) error.textContent = message;
	}

	private setActivePayment(type: 'online' | 'cash') {
		this.onlineButton.classList.toggle('button_alt-active', type === 'online');
		this.cashButton.classList.toggle('button_alt-active', type === 'cash');
	}
}

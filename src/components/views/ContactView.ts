import { IUserData } from '../../types';
import { EventEmitter } from '../base/events';

export class ContactView {
	private emailInput: HTMLInputElement;
	private phoneInput: HTMLInputElement;
	private submitButton: HTMLButtonElement;

	constructor(
		private form: HTMLFormElement,
		private events: EventEmitter,
		private onSuccess: () => void
	) {
		this.emailInput = this.form.querySelector('input[placeholder="Введите Email"]')!;
		this.phoneInput = this.form.querySelector('input[placeholder="+7 ("]')!;
		this.submitButton = this.form.querySelector('button[type="submit"]')!;

		this.form.addEventListener('submit', this.handleSubmit.bind(this));
		this.form.addEventListener('input', this.validate.bind(this));
		this.phoneInput.addEventListener('input', this.maskPhone.bind(this));

		this.validate();
	}

	private handleSubmit(event: Event) {
		event.preventDefault();
		if (!this.submitButton.disabled) {
			this.onSuccess();
		}
	}

	public validate() {
		const isEmailValid = /^[\w-.]+@[\w-]+\.[a-z]{2,4}$/i.test(this.emailInput.value.trim());
		const isPhoneValid = /\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}/.test(this.phoneInput.value);
		this.submitButton.disabled = !(isEmailValid && isPhoneValid);
	}

	private maskPhone() {
		let value = this.phoneInput.value.replace(/\D/g, '');
		if (value.startsWith('8')) value = '7' + value.slice(1);
		if (!value.startsWith('7')) value = '7' + value;

		const template = '+7 (___) ___-__-__';
		let i = 0;
		this.phoneInput.value = template.replace(/./g, (char) =>
			/[_\d]/.test(char) && i < value.length ? value.charAt(i++) : char
		);
	}
}

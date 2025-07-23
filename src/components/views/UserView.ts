import { IUserData } from '../../types';
import { EventEmitter } from '../base/events';

export class UserView {
	protected submitButton: HTMLButtonElement;
	protected errorContainer: HTMLElement;

	constructor(
		protected form: HTMLFormElement,
		protected events: EventEmitter
	) {
		this.submitButton = this.form.querySelector('button[type="submit"], .button[data-next]')!;
		this.errorContainer = this.form.querySelector('.form__error, .form__errors')!;

		this.form.addEventListener('input', () => this.handleChange());
		this.form.addEventListener('change', () => this.handleChange());
	}

	handleChange() {
		this.events.emit('form:change', this.getData());
	}

	getData(): IUserData {
		const formData = new FormData(this.form);
		return {
			address: formData.get('address') as string,
			email: formData.get('email') as string,
			phone: formData.get('phone') as string,
			payment: formData.get('payment') === 'online'
	? 'online'
	: formData.get('payment') === 'cash'
	? 'cash'
	: undefined,

		};
	}

	setErrors(message: string) {
		if (this.errorContainer) {
			this.errorContainer.textContent = message;
			this.errorContainer.style.display = message ? 'block' : 'none';
		}
	}

	setButtonDisabled(state: boolean) {
		this.submitButton.disabled = state;
	}
}

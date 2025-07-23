export class Modal {
	protected container: HTMLElement;
	protected content: HTMLElement;
	protected closeButtons: NodeListOf<HTMLButtonElement>;

	constructor(protected element: HTMLElement) {
		this.container = element.querySelector('.modal__container') as HTMLElement;
		this.content = element.querySelector('.modal__content') as HTMLElement;
		this.closeButtons = element.querySelectorAll('.modal__close');

		this.closeButtons.forEach(btn => btn.addEventListener('click', () => this.close()));
		element.addEventListener('click', (e) => {
			if (e.target === element) this.close();
		});

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') this.close();
		});
	}

	setContent(content: HTMLElement | string) {
	this.content.innerHTML = '';

	if (typeof content === 'string') {
		this.content.innerHTML = content;
	} else {
		this.content.appendChild(content.cloneNode(true));
	}
}


	open() {
		this.element.classList.add('modal_active');
		document.querySelector('.page__wrapper')?.classList.add('page__wrapper_locked');
	}

	close() {
		this.element.classList.remove('modal_active');
		document.querySelector('.page__wrapper')?.classList.remove('page__wrapper_locked');
	}
}

export class CardBasketView {
	private element: HTMLElement;
	public onDelete: (index: number) => void = () => {};

	constructor(template: HTMLTemplateElement) {
		// Клонируем содержимое шаблона
		this.element = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

		// Подписываемся на кнопку удаления (делегирование)
		this.element.querySelector('.basket__list')?.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('basket__item-delete')) {
				const index = Number(
					target.closest('.basket__item')?.querySelector('.basket__item-index')?.textContent
				);
				if (!isNaN(index)) this.onDelete(index);
			}
		});
	}

	render(): HTMLElement {
		return this.element;
	}
}

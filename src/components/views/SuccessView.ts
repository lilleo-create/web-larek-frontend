// SuccessView.ts
export class SuccessView {
	constructor(private container: HTMLElement) {}

	render(title: string, description?: string): void {
		this.container.innerHTML = `
			<div class="order-success">
				<h2 class="order-success__title">${title}</h2>
				<p class="order-success__description">${description ?? ''}</p>
				<button class="button order-success__close">За новыми покупками!</button>
			</div>
		`;

		this.container
			.querySelector('.order-success__close')
			?.addEventListener('click', () => {
				this.container.dispatchEvent(new CustomEvent('success:close', { bubbles: true }));
			});
	}
}

export class CardBasketView {
  private element: HTMLElement;
  public onDelete: (id: string) => void = () => {};

  constructor(private template: HTMLTemplateElement) {
    this.element = this.template.content.firstElementChild!.cloneNode(true) as HTMLElement;
  }

  // View НЕ хранит данные — заполняет и «забывает»
  render(data: { id: string; index: number; title: string; price: number }): HTMLElement {
    const root = this.element;
    root.dataset.id = data.id;

    const indexEl = root.querySelector('.basket__item-index') as HTMLElement | null;
    const titleEl = root.querySelector('.card__title') as HTMLElement | null;
    const priceEl = root.querySelector('.card__price') as HTMLElement | null;
    const delBtn  = root.querySelector('.basket__item-delete') as HTMLButtonElement | null;

    if (indexEl) indexEl.textContent = String(data.index);
    if (titleEl) titleEl.textContent = data.title;
    if (priceEl) priceEl.textContent = `${data.price} синапсов`;
    if (delBtn) delBtn.onclick = () => this.onDelete(data.id);

    return root;
  }
}

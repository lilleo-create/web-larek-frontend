// components/views/ModalView.ts
export default class Modal {
  public element: HTMLElement;
  private contentEl: HTMLElement;
  private closeButtons: NodeListOf<Element>;

  constructor(root: string | HTMLElement = '#modal') {
    const el = typeof root === 'string' ? document.querySelector(root) : root;
    if (!el) throw new Error(`Modal root ${typeof root === 'string' ? root : '#[HTMLElement]'} not found`);
    this.element = el as HTMLElement;

    const content = this.element.querySelector('.modal__content');
    if (!content) throw new Error('Modal content (.modal__content) not found');
    this.contentEl = content as HTMLElement;

    this.closeButtons = this.element.querySelectorAll('[data-action="modal:close"]');

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });
    this.closeButtons.forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      })
    );
  }

  setContent(node: HTMLElement): void {
    this.contentEl.replaceChildren(node);
  }
  open(): void {
    this.element.classList.add('modal_active');
    document.querySelector('.page__wrapper')?.classList.add('page__wrapper_locked');
  }
  close(): void {
    this.element.classList.remove('modal_active');
    document.querySelector('.page__wrapper')?.classList.remove('page__wrapper_locked');
  }
  isOpen(): boolean {
    return this.element.classList.contains('modal_active');
  }
}

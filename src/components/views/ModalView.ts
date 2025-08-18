export default class Modal {
  public element: HTMLElement;
  private contentEl: HTMLElement;
  private closeButtons: NodeListOf<HTMLElement>;
  private opened = false;

  constructor(root: string | HTMLElement = '#modal') {
    const el = typeof root === 'string' ? document.querySelector(root) : root;
    if (!el) throw new Error(`Modal root ${typeof root === 'string' ? root : '#[HTMLElement]'} not found`);
    this.element = el as HTMLElement;

    this.contentEl =
      (this.element.querySelector('.modal__content') as HTMLElement | null) ?? this.element;

    this.closeButtons = this.element.querySelectorAll<HTMLElement>(
      '[data-action="modal:close"], .modal__close'
    );

    this.element.addEventListener('mousedown', (e) => {
      if (e.target === this.element) this.close();
    });

    this.closeButtons.forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      })
    );
  }

  private onEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  };

  setContent(node: HTMLElement) {
    this.contentEl.replaceChildren(node);
  }

  open(): void {
    if (this.opened) return;
    this.opened = true;

    this.element.classList.add('modal_active');
    document.querySelector('.page__wrapper')?.classList.add('page__wrapper_locked');

    document.addEventListener('keydown', this.onEsc);
  }

  close(): void {
    if (!this.opened) return;
    this.opened = false;

    this.element.classList.remove('modal_active');
    document.querySelector('.page__wrapper')?.classList.remove('page__wrapper_locked');

    document.removeEventListener('keydown', this.onEsc);
  }

  isOpen(): boolean {
    return this.opened;
  }
}

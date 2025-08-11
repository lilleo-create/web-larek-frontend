export class ContactView {
  private form!: HTMLFormElement;
  private emailInput!: HTMLInputElement;
  private phoneInput!: HTMLInputElement;
  private submitBtn!: HTMLButtonElement;
  private errorsEl!: HTMLElement | null;

  constructor(private selector: string) {}

  render(): HTMLFormElement {
    const tpl = document.querySelector<HTMLTemplateElement>(this.selector);
    if (!tpl) throw new Error(`Template ${this.selector} not found`);
    const content = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;

    this.form = content as HTMLFormElement;
    this.emailInput = this.form.elements.namedItem('email') as HTMLInputElement;
    this.phoneInput = this.form.elements.namedItem('phone') as HTMLInputElement;
    this.submitBtn = this.form.querySelector('button[type="submit"]') as HTMLButtonElement;
    this.errorsEl = this.form.querySelector('.form__errors');

    if (!this.emailInput || !this.phoneInput || !this.submitBtn) {
      throw new Error('Contacts template missing required fields');
    }

    return this.form;
  }

  onEmailInput(cb: () => void) { this.emailInput.addEventListener('input', cb); }
  onPhoneInput(cb: () => void) { this.phoneInput.addEventListener('input', cb); }
  onSubmit(cb: () => void) { this.form.addEventListener('submit', (e) => { e.preventDefault(); cb(); }); }

  setSubmitDisabled(disabled: boolean) { this.submitBtn.disabled = disabled; }
  setErrors(text: string) { if (this.errorsEl) this.errorsEl.textContent = text; }

  getData() { return { email: this.emailInput.value, phone: this.phoneInput.value }; }
}

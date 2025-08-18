export class SuccessView {
  constructor(private root: HTMLElement) {}

  render(title: string, text: string) {
    const wrap = document.createElement('div');
    wrap.className = 'success';
    wrap.innerHTML = `
<div class="order-success">
  <h2 class="order-success__title">${title}</h2>
  <p class="order-success__description">${text ?? ''}</p>
  <button class="button order-success__close" data-action="success:close">За новыми покупками!</button>
</div>`;

    const btn = wrap.querySelector('.order-success__close') as HTMLButtonElement | null;
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.root.dispatchEvent(new Event('success:close'));
      });
    }

    this.root.replaceChildren(wrap);
  }

  onClose(cb: () => void) {
    this.root.addEventListener('success:close', cb);
  }
}

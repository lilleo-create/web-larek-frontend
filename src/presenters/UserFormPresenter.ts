// src/presenters/UserFormPresenter.ts
import { EventEmitter } from '../components/base/events';
import Modal from '../components/views/ModalView';
import OrderView from '../components/views/OrderView';
import type { OrderValidationResult } from '../models/UserModel';
import { ContactView } from '../components/views/ContactView';
import { SuccessView } from '../components/views/SuccessView';

export class UserFormPresenter {
  // шаг 1: ждём клик "Далее"
  private awaitingNext = false;
  // шаг 2: ждём клик "Оплатить"
  private awaitingPay  = false;

  constructor(
    private orderView: OrderView,
    private events: EventEmitter,
    private modal: Modal
  ) {
    // === ШАГ 1: адрес + оплата ===
    this.orderView.onChange((data) => {
      this.events.emit('user:update', data);
      this.events.emit('user:validate:order');
    });

    this.orderView.onNext(() => {
      this.awaitingNext = true;
      this.events.emit('user:validate:order');
    });

    this.events.on('user:validated:order', (res: OrderValidationResult) => {
      const ok = res.addressOk && res.paymentOk;
      this.orderView.showOrderErrors(res);
      this.orderView.setNextDisabled(!ok);
      if (ok && this.awaitingNext) {
        this.awaitingNext = false;
        this.openContacts();
      }
    });
  }

  // === ШАГ 2: контакты ===
  private openContacts() {
    const tpl = document.querySelector<HTMLTemplateElement>('#contacts');
    if (!tpl) throw new Error('Template #contacts not found');

    const form = tpl.content.firstElementChild!.cloneNode(true) as HTMLFormElement;
    const contactView = new ContactView(form, this.events);

    // вставляем форму в модалку
    this.modal.setContent(form);

    // любое изменение полей -> обновляем модель и просим валидацию,
    // НО переход вперёд делаем только по submit (см. ниже)
    form.addEventListener('input', () => {
      const email = (form.querySelector('input[name="email"]') as HTMLInputElement)?.value?.trim() || '';
      const phone = (form.querySelector('input[name="phone"]') as HTMLInputElement)?.value?.trim() || '';
      const nameEl = form.querySelector('input[name="name"]') as HTMLInputElement | null;
      const patch: any = { email, phone };
      if (nameEl) patch.name = (nameEl.value ?? '').trim();
      this.events.emit('user:update', patch);
      this.events.emit('user:validate:contacts');
    });

    // клик "Оплатить": только ставим флаг и запрашиваем валидацию
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.awaitingPay = true;
      this.events.emit('user:validate:contacts');
    });

    // единый обработчик результата контактов
    const onValidatedContacts = (res: { ok: boolean; errors?: Record<string,string> }) => {
      contactView.setSubmitEnabled(res.ok);
      contactView.showErrors(res.errors || {});
      // переходим на успех ТОЛЬКО если пользователь нажал "Оплатить"
      if (res.ok && this.awaitingPay) {
        this.awaitingPay = false;
        // отписываемся, чтобы не плодить обработчики при повторных открытиях
        this.events.off('user:validated:contacts', onValidatedContacts);
        this.openSuccess();
      }
    };

    this.events.on('user:validated:contacts', onValidatedContacts);
  }

  // === УСПЕХ ===
  private openSuccess() {
    const box = document.createElement('div');
    const view = new SuccessView(box);
    view.render('Заказ оформлен', 'Спасибо за покупку!');

    box.addEventListener('success:close', () => {
      this.modal.close();
      this.events.emit('cart:clear');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    this.modal.setContent(box);
    this.modal.open();
  }
}

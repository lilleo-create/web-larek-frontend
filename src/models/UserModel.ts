import { EventEmitter } from '../components/base/events';

// Результат валидации, который ждёт OrderView.showOrderErrors
export type OrderValidationResult = {
  addressOk: boolean;
  paymentOk: boolean;
  addressError?: string;
};

type PaymentAny = 'online' | 'card' | 'cash' | '';
type UserState = {
  address?: string;
  payment?: PaymentAny;
  email?: string;
  phone?: string;
  name?: string;
};

export class UserModel {
  private data: UserState = {};

  constructor(private events: EventEmitter) {
    this.events.on('user:update', (patch: Partial<UserState>) => {
      this.data = { ...this.data, ...patch };
    });
    this.events.on('user:validate:order', () => {
      this.events.emit('user:validated:order', this.validateOrder());
    });
    this.events.on('user:validate:contacts', () => {
      const r = this.validateContacts();
      this.events.emit('user:validated:contacts', r);
    });
    
  }
  private normalizePayment(p?: PaymentAny): 'card' | 'cash' | '' {
    if (p === 'online') return 'card';
    if (p === 'card' || p === 'cash') return p;
    return '';
  }

  private validateOrder(): OrderValidationResult {
    const addressOk = !!this.data.address && this.data.address.trim().length > 0;
    const paymentOk = this.normalizePayment(this.data.payment) !== '';

    return {
      addressOk,
      paymentOk,
      addressError: addressOk ? undefined : 'Укажите адрес',
    };
  }
  validateContacts(): { ok: boolean; errors: Partial<Record<'email'|'phone'|'name', string>> } {
    const errors: Partial<Record<'email'|'phone'|'name', string>> = {};
  
    const email = (this.data as any).email as string | undefined;
    const phone = (this.data as any).phone as string | undefined;
    const name  = (this.data as any).name  as string | undefined;
  
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Некорректный email';
    const digits = (phone || '').replace(/\D/g, '');
    if (!/^7\d{10}$/.test(digits)) errors.phone = 'Некорректный телефон';
    if (typeof name === 'string' && !name.trim()) errors.name = 'Введите имя';
  
    return { ok: Object.keys(errors).length === 0, errors };
  }
}

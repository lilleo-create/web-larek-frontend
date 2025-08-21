import { IUserData } from '../types';

export type OrderValidationResult = {
  ok: boolean;
  addressOk: boolean;
  paymentOk: boolean;
  addressError?: string;
  paymentError?: string;
  errors?: string;
};

export type ContactsValidationResult = {
  valid: boolean;
  errors: Record<string, string>;
};

export class UserModel {
  validateOrder(data: Pick<IUserData, 'address' | 'payment'>): OrderValidationResult {
    const address = String(data.address ?? '').trim();
    const payment = String(data.payment ?? '').trim();

    // Адрес валиден, если НЕ пустой
    const addressOk = address.length > 0;
    const paymentOk = payment === 'online' || payment === 'cash';

    return {
      ok: addressOk && paymentOk,
      addressOk,
      paymentOk,
      addressError: addressOk ? '' : 'Введите адрес',
      paymentError: paymentOk ? '' : 'Выберите способ оплаты',
      errors: '',
    };
  }

  validateContacts(data: Pick<IUserData, 'email' | 'phone'>): ContactsValidationResult {
    const errors: Record<string, string> = {};
  
    const email = (data.email ?? '').trim();
    const phoneRaw = (data.phone ?? '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Введите корректный email';
    }

    const digits = phoneRaw.replace(/\D/g, '');

    if (digits.length < 11 || digits.length > 11) {
      errors.phone = 'Введите корректный телефон';
    }
  
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

export default UserModel;

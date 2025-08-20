// src/models/UserModel.ts
import { IUserData } from '../types';

export type OrderValidationResult = {
  ok: boolean;
  addressOk: boolean;
  paymentOk: boolean;
  addressError?: string;
  paymentError?: string;
  errors?: string; // общий текст (если нужен)
};

export class UserModel {
  // Валидация шага "адрес + оплата"
  validateOrder(data: IUserData): OrderValidationResult {
    const address = String(data.address ?? '').trim();
    const payment = String(data.payment ?? '').trim();

    const addressOk = address.length >= 10; // мягкое правило: не короче 10 символов
    const paymentOk = payment === 'online' || payment === 'cash';

    return {
      ok: addressOk && paymentOk,
      addressOk,
      paymentOk,
      addressError: addressOk ? '' : 'Введите адрес (не короче 10 символов).',
      paymentError: paymentOk ? '' : 'Выберите способ оплаты.',
      errors: !addressOk
        ? 'Проверьте адрес'
        : !paymentOk
        ? 'Выберите способ оплаты'
        : '',
    };
  }

  // Валидация шага "контакты"
  validateContacts(data: IUserData): {
    ok: boolean;
    emailOk: boolean;
    phoneOk: boolean;
    errorText: string;
  } {
    const email = String(data.email ?? '').trim();
    const phone = String(data.phone ?? '').trim();

    // простые, но достаточные проверки
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhone = /^\+?\d[\d\s\-()]{7,}$/.test(phone);

    return {
      ok: isEmail && isPhone,
      emailOk: isEmail,
      phoneOk: isPhone,
      errorText: !isEmail
        ? 'Введите корректный email'
        : !isPhone
        ? 'Введите корректный телефон'
        : '',
    };
  }
}

export default UserModel;

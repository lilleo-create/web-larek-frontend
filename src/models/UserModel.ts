// models/UserModel.ts — ДОБАВИТЬ методы
import { IUserData } from '../types';

export class UserModel {
     validateOrder(data: IUserData) {
    const hasAddress = data.address?.trim().length > 0;
    const hasPayment = !!data.payment;
    return {
      ok: hasAddress && hasPayment,
      errors: hasAddress ? '' : 'Необходимо указать адрес',
    };
  }

  validateContacts(email: string, phone: string) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email ?? '').trim());
    const isPhone = (phone ?? '').replace(/\D/g, '').length >= 11;
    return {
      ok: isEmail && isPhone,
      emailOk: isEmail,
      phoneOk: isPhone,
      errorText: !isEmail ? 'Введите корректный email' : (!isPhone ? 'Введите корректный телефон' : ''),
    };
  }
}

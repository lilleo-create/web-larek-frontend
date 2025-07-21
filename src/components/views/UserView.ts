import { IUserData } from '../../types';

export class UserView {
    constructor(protected form: HTMLFormElement) {}

    getData(): IUserData {
        const formData = new FormData(this.form);
        return {
            address: formData.get('address') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            payment: (formData.get('payment') as 'online' | 'cash') || 'online',
        };
    }
}

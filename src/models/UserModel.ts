import { IUserData } from '../types';
import { EventEmitter } from '../components/base/events';

export class UserModel {
    protected data: Partial<IUserData> = {};

    constructor(protected events: EventEmitter) {}

    setData(newData: Partial<IUserData>) {
        this.data = { ...this.data, ...newData };
        this.events.emit('user:update', this.data);
    }

    getData(): Partial<IUserData> {
        return this.data;
    }

    clear() {
        this.data = {};
        this.events.emit('user:update', this.data);
    }
}

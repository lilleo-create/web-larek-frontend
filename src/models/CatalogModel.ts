import { IProduct } from '../types';
import { EventEmitter } from '../components/base/events';

export class CatalogModel {
    protected products: IProduct[] = [];

    constructor(protected events: EventEmitter) {}

    setProducts(products: IProduct[]) {
        this.products = products;
        this.events.emit('catalog:update', this.products);
    }

    getProductById(id: string): IProduct | undefined {
        return this.products.find(product => product.id === id);
    }

    getProducts(): IProduct[] {
        return this.products;
    }
}

import { IProduct } from '../types/product';
import { EventEmitter } from '../components/base/events';

export class CatalogModel {
    protected products: IProduct[] = [];

    constructor(protected events: EventEmitter) {}

    setProducts(products: IProduct[]) {
        this.products = products;
    }

    getProductById(id: string): IProduct | undefined {
        return this.products.find((item) => item.id === id);
    }
}

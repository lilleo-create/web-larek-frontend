import { CatalogModel } from '../models/CatalogModel';
import { CartModel } from '../models/CartModel';
import Modal from '../components/views/ModalView';
import { CatalogView } from '../components/views/CatalogView';
import { ProductCardView } from '../components/views/ProductCardView';
import { CardPreviewView } from '../components/views/CardPreviewView';
import { EventEmitter } from '../components/base/events';
import { IProduct } from '../types';

export class ProductPresenter {
  constructor(
    private catalogModel: CatalogModel,
    private cartModel: CartModel,
    private catalogView: CatalogView,
    private modal: Modal,
    private events: EventEmitter
  ) {
    this.events.on('cart:add', (p: any) => {
      if (!p) return;
      this.cartModel.add({
        id: String(p.id),
        title: String(p.title),
        price: Number(p.price) || 0,
        quantity: Number(p.quantity) || 1,
      });
    });
    this.events.on('cart:remove', (p: any) => {
      if (!p) return;
      this.cartModel.remove(String(p.id));
    });
  }

  public init(products?: IProduct[]) {
    if (products) this.mount(products);
  }

  public mount(products: IProduct[]) {
    this.catalogView.clear();

    products.forEach((product) => {
      const card = new ProductCardView(this.catalogView.template, product);

      card.on('buy', () => {
        const inCart = this.isInCart(product.id);
        if (inCart) {
          this.cartModel.remove(product.id);
        } else {
          this.cartModel.add({
            id: product.id,
            title: product.title,
            price: typeof product.price === 'number' ? product.price : 0,
            quantity: 1,
          });
        }
      });

      card.on('click', () => {
        const inCart = this.isInCart(product.id);
        const full = new CardPreviewView(this.events).render(product, inCart); // ← 1 арг. в ctor, 2 — в render
        this.modal.setContent(full);
        this.modal.open();
      });

      this.catalogView.addCard(card.getElement());
    });
  }

  private isInCart(id: string): boolean {
    const anyModel = this.cartModel as any;
    if (typeof anyModel.inCart === 'function') return !!anyModel.inCart(id);
    if (typeof anyModel.getItems === 'function') {
      return !!anyModel.getItems().some((i: any) => i.id === id);
    }
    return false;
  }
}

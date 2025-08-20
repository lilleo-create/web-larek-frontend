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
  ) { }

  init(products: IProduct[]) {
    this.catalogModel.setProducts(products);
    this.catalogView.clear();
    this.events.on('modal:close', () => this.modal.close());


    products.forEach((product) => {
      const card = new ProductCardView(this.catalogView.template, product);
      this.catalogView.addCard(card.getElement());

      (card as any).setInCart?.(this.cartModel.inCart(product.id));

      card.on('buy', ({ id }: { id: string }) => {
        if (this.cartModel.inCart(id)) return;

        this.cartModel.add({
          id: product.id,
          title: product.title,
          price: typeof product.price === 'number' ? product.price : 0,
          quantity: 1,
        });
        
        const m: any = this.cartModel as any;
        const items = typeof m.getItems === 'function' ? m.getItems() : (Array.isArray(m.items) ? m.items : []);
        this.events.emit('cart:updated:quiet', {
          count: items.length,
          total: items.reduce((s: number, it: any) => s + (Number(it?.price) || 0), 0),
        });

        (card as any).setInCart?.(true);
        this.events.emit('cart:changed');
      });

      card.on('click', () => {
        const full = new CardPreviewView(product, this.cartModel, this.events).render();
        this.modal.setContent(full);
        this.modal.open();
      });
    });
  }
}

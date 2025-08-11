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
	) {}
	
	init(products: IProduct[]) {
		this.catalogModel.setProducts(products);
		this.catalogView.clear();

		products.forEach((product) => {
			const card = new ProductCardView(this.catalogView.template, product);
this.catalogView.addCard(card.getElement());

// стартовое состояние
card.setInCart?.(this.cartModel.inCart(product.id));

card.on('buy', ({ id }: { id: string }) => {
  if (this.cartModel.inCart(id)) return;

  this.cartModel.add({
    id: product.id,
    title: product.title,
    price: typeof product.price === 'number' ? product.price : 0,
  });

  card.setInCart?.(true);
  this.events.emit('cart:changed'); // если нужен бейдж/итог
			});

			card.on('click', ({ id }: { id: string }) => {
				const full = new CardPreviewView(product, this.cartModel, this.events).render();
				this.modal.setContent(full);
				this.modal.open();
			});
		});
	}
}

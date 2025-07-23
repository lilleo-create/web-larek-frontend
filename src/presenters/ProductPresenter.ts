import { CatalogModel } from '../models/CatalogModel';
import { CartModel } from '../models/CartModel';
import { Modal } from '../components/views/ModalView';
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
		private cardCatalogView: ProductCardView,
		private modal: Modal,
		private events: EventEmitter
	) {
		this.cardCatalogView.onClick = this.onOpenProduct;
		this.cardCatalogView.onBuy = this.onBuyProduct;
	}

	init(products: IProduct[]) {
		this.catalogModel.setProducts(products);
		this.catalogView.render(products);

		products.forEach(product => {
			this.cardCatalogView.render(product); // 👈 один продукт за раз
		});
	}



	onBuyProduct = (id: string) => {
		const product = this.catalogModel.getProductById(id);
		if (!product || product.disabled) return;

		const isInCart = this.cartModel.getItems().some(item => item.id === id);
		isInCart
			? this.cartModel.remove(id)
			: this.cartModel.add({
				id: product.id,
				title: product.title,
				price: typeof product.price === 'number' ? product.price : 0
			});

	};

	onOpenProduct = (id: string) => {
		const product = this.catalogModel.getProductById(id);
		if (!product) return;
		console.log('[ProductPresenter] открыл продукт:', product.title); // 👈 добавь

		const cardElement = new CardPreviewView(product, this.cartModel, this.events).render();
		this.modal.setContent(cardElement);
		this.modal.open();
		console.log('[ProductCardView] создаётся карточка:', product.title);
	};

}

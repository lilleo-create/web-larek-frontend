import { CatalogModel } from '../models/CatalogModel';
import { CartModel } from '../models/CartModel';
import {Modal} from '../components/views/ModalView';
import { CatalogView } from '../components/views/CatalogView';
import { ProductCardView } from '../components/views/ProductCardView';
import { CardPreviewView } from '../components/views/CardPreviewView';
import { EventEmitter } from '../components/base/events';
import { IProduct } from '../types';

export class ProductPresenter {
	private productCards: Record<string, ProductCardView> = {}; // 🧠 сохраняем карточки по id

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
			this.productCards[product.id] = card;

			// Покупка/удаление
			card.on('buy', ({ id }: { id: string }) => {
				const inCart = this.cartModel.inCart(id);
				if (inCart) {
					this.cartModel.remove(id);
				} else {
					this.cartModel.add({
						id: product.id,
						title: product.title,
						price: typeof product.price === 'number' ? product.price : 0,
					});
				}
			});

			// Открытие модалки
			card.on('click', ({ id }: { id: string }) => {
				const full = new CardPreviewView(product, this.cartModel, this.events).render();
				this.modal.setContent(full);
				this.modal.open();
			});
		});

		// 🎯 Обновляем все карточки в каталоге при изменении корзины
		this.events.on('cart:change', () => {
			Object.entries(this.productCards).forEach(([id, card]) => {
				card.updateButton(this.cartModel.inCart(id));
			});
		});
	}
}

// ✅ Стили
import './scss/styles.scss';

// ✅ Базовые модули и модели
import { EventEmitter } from './components/base/events';
import { CartModel } from './models/CartModel';
import { CatalogModel } from './models/CatalogModel';
import { Api } from './components/base/api'; // 🔌 Добавлено

// ✅ Представления
import { CatalogView } from './components/views/CatalogView';
import { CartView } from './components/views/CartView';
import { CardBasketView } from './components/views/CardBasketView';
import { UserView } from './components/views/UserView';
import Modal from './components/views/ModalView';
import { CardCatalogView } from './components/views/CardCatalogView';

import {
	getBasketCounter,
	basketElement,
	basketTemplate,
	modalContainer,
	addressForm
} from './components/base/dom';

// ✅ Презентеры
import { UserFormPresenter } from './presenters/UserFormPresenter';
import { CartPresenter } from './presenters/CartPresenter';
import { ProductPresenter } from './presenters/ProductPresenter';

document.addEventListener('DOMContentLoaded', () => {
	// ✅ Системные сущности
	const events = new EventEmitter();
	const api = new Api('https://larek-api.nomoreparties.co');

	const cartModel = new CartModel(events);
	const catalogModel = new CatalogModel(events);
	const modal = new Modal(modalContainer);

	// ✅ Представления
	const cardBasketView = new CardBasketView(basketTemplate);
	const cartView = new CartView(basketElement, events, getBasketCounter());
	const userView = new UserView(addressForm, events);

	const cardCatalogView = new CardCatalogView(
		'#card-catalog',
		(id: string) => events.emit('card:select', { id })
	);

	const catalogView = new CatalogView('#card-catalog', '.gallery');

	// ✅ Презентеры
	const cartPresenter = new CartPresenter(cartModel, cartView, cardBasketView, events, modal);
	new UserFormPresenter(userView, events, modal, api, cartModel);

	const productPresenter = new ProductPresenter(
		catalogModel,
		cartModel,
		catalogView,
		modal,
		events
	);

	// 🔁 Получение товаров с сервера
	api.getProductList().then((products) => {
		productPresenter.init(products);
	});

	cartPresenter.init();
});

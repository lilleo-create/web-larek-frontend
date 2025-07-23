import './scss/styles.scss';
import { products } from './utils/products';

import { EventEmitter } from './components/base/events';
import { CartModel } from './models/CartModel';
import { CatalogModel } from './models/CatalogModel';

import { CatalogView } from './components/views/CatalogView';
import { CartView } from './components/views/CartView';
import { ProductCardView } from './components/views/ProductCardView';
import { CardBasketView } from './components/views/CardBasketView';
import { UserView } from './components/views/UserView';
import { ContactView } from './components/views/ContactView';
import { Modal } from './components/views/ModalView';

import { UserFormPresenter } from './presenters/UserFormPresenter';
import { CartPresenter } from './presenters/CartPresenter';
import { ProductPresenter } from './presenters/ProductPresenter';

import {
	catalogElement,
	cartElement,
	priceElement,
	orderButton,
	modalContainer,
	catalogTemplate,
	basketTemplate,
	userForm,
	addressForm
} from './components/base/dom';

// Системные сущности
const events = new EventEmitter();
const cartModel = new CartModel(events);
const catalogModel = new CatalogModel(events);
const modal = new Modal(modalContainer);

// Представления
const cardCatalogView = new ProductCardView(catalogTemplate);
const catalogView = new CatalogView(catalogElement, cardCatalogView);
const cardBasketView = new CardBasketView(basketTemplate);
const cartView = new CartView(cartElement, events, cardBasketView);
const userView = new UserView(addressForm, events);
const contactView = new ContactView(userForm, events, () => {
	cartModel.clear();
	events.emit('cart:change', cartModel.getItems());
	events.emit('form:success');
});

// Презентеры
new CartPresenter(cartModel, cartView, events, modal);
new UserFormPresenter(userView, events, modal);
const productPresenter = new ProductPresenter(catalogModel, cartModel, catalogView, cardCatalogView, modal, events);
productPresenter.init(products);

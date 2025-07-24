import './scss/styles.scss';
import { products } from './utils/products';

import { EventEmitter } from './components/base/events';
import { CartModel } from './models/CartModel';
import { CatalogModel } from './models/CatalogModel';

import { CatalogView } from './components/views/CatalogView';
import { CartView } from './components/views/CartView';
import { CardBasketView } from './components/views/CardBasketView';
import { UserView } from './components/views/UserView';
import  Modal  from './components/views/ModalView';

import { UserFormPresenter } from './presenters/UserFormPresenter';
import { CartPresenter } from './presenters/CartPresenter';
import { ProductPresenter } from './presenters/ProductPresenter';

import {
	cartElement,
	priceElement,
	orderButton,
	modalContainer,
	basketTemplate,
	userForm,
	addressForm
} from './components/base/dom';

// ✅ Системные сущности
const events = new EventEmitter();
const cartModel = new CartModel();
const catalogModel = new CatalogModel(events);
const modal = new Modal(modalContainer);

// ✅ Представления
const catalogView = new CatalogView('#card-catalog', '.gallery'); // селекторы шаблона и контейнера
const cardBasketView = new CardBasketView(basketTemplate);
const cartView = new CartView(cartElement, events, cardBasketView);
const userView = new UserView(addressForm, events);

// ✅ Презентеры
new CartPresenter(cartModel, cartView, events, modal);
new UserFormPresenter(userView, events, modal);
const productPresenter = new ProductPresenter(
	catalogModel,
	cartModel,
	catalogView,
	modal,
	events
);
productPresenter.init(products);

import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { CartModel } from './models/CartModel';
import { CatalogModel } from './models/CatalogModel';

import { CatalogView } from './components/views/CatalogView';
import { CartView } from './components/views/CartView';
import { CardBasketView } from './components/views/CardBasketView';
import { UserView } from './components/views/UserView';
import Modal from './components/views/ModalView';

import { UserFormPresenter } from './presenters/UserFormPresenter';
import { CartPresenter } from './presenters/CartPresenter';
import { ProductPresenter } from './presenters/ProductPresenter';

import {
	cartElement,
	modalContainer,
	basketTemplate as basketTemplateFromDOM,
	addressForm
} from './components/base/dom';

import { Api } from './components/base/api'; // ✅ импорт API
import { API_URL } from './utils/constants'; // ✅ API адрес
import { CDN_URL } from './utils/constants';
export function getImageUrl(image: string): string {
  return `${CDN_URL}${image}`;
}

// ✅ Системные сущности
const events = new EventEmitter();
const cartModel = new CartModel();
const catalogModel = new CatalogModel(events);
const modal = new Modal(modalContainer);
const api = new Api(API_URL);

// ✅ Представления
const catalogView = new CatalogView('#card-catalog', '.gallery');

const basketTemplate = document.querySelector<HTMLTemplateElement>('#basket');
const cardBasketTemplate = document.querySelector<HTMLTemplateElement>('#card-basket');
if (!basketTemplate || !cardBasketTemplate) throw new Error('Basket templates not found');


const cartView = new CartView(events, basketTemplate, cardBasketTemplate);

// ✅ Презентеры
new CartPresenter(cartModel, cartView, events, modal);
const productPresenter = new ProductPresenter(
	catalogModel,
	cartModel,
	catalogView,
	modal,
	events
);

api.getProducts()
  .then((products) => {
    productPresenter.init(products); // или catalogModel.setProducts(products)
  })
  .catch((err) => {
    console.error('Ошибка при загрузке товаров с сервера:', err);
  });
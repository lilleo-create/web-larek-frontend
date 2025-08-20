import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { CartModel } from './models/CartModel';
import { CatalogModel } from './models/CatalogModel';

import { CatalogView } from './components/views/CatalogView';
import { CartView } from './components/views/CartView';
import Modal from './components/views/ModalView';
import HeaderView from './components/views/HeaderView';

import { CartPresenter } from './presenters/CartPresenter';
import { ProductPresenter } from './presenters/ProductPresenter';

import {
  modalContainer,
  basketTemplate,
  cardBasketTemplate,
} from './components/base/dom';

import { Api } from './components/base/api';
import { API_URL, CDN_URL } from './utils/constants';

export function getImageUrl(image: string): string {
  return `${CDN_URL}${image}`;
}

// =============== СИСТЕМА ===============
const events = new EventEmitter();
const cartModel = new CartModel();
const catalogModel = new CatalogModel(events);
const api = new Api(API_URL);
const modal = new Modal(modalContainer);

// =============== VIEW ===============
const headerView = new HeaderView('.header', events);
const catalogView = new CatalogView('#card-catalog', '.gallery');
const cartView = new CartView(events, basketTemplate, cardBasketTemplate);

// =============== PRESENTERS ===============
new CartPresenter(cartModel, cartView, events, modal);
const productPresenter = new ProductPresenter(
  catalogModel,
  cartModel,
  catalogView,
  modal,
  events
);

// =============== СОБЫТИЯ UI/APP ===============
events.on('cart:count', ({ count }: { count: number }) => {
  headerView.setCartCount(count);
});

events.on('ui:scrollTop', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

{
  const m: any = cartModel as any;
  const items = typeof m.getItems === 'function' ? m.getItems() : (Array.isArray(m.items) ? m.items : []);
  headerView.setCartCount(items.length);
}

events.on('cart:updated:quiet', ({ count }: { count: number }) => {
  headerView.setCartCount(count);
});

events.on('cart:clear', () => {
  headerView.setCartCount(0);
});

// =============== ДАННЫЕ ===============
api.getProducts()
  .then((products) => {
    productPresenter.init(products);
  })
  .catch((err) => {
    console.error('Ошибка при загрузке товаров с сервера:', err);
  });

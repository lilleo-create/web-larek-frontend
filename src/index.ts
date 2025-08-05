import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { Api } from './components/base/api';
import { EventEmitter } from './components/base/events';

import { Modal } from './components/views/ModalView';

import { CatalogModel } from './models/CatalogModel';
import { CartModel } from './models/CartModel';
import { UserModel } from './models/UserModel';

import { CardCatalogView } from './components/views/CardCatalogView';
import { CardPreviewView } from './components/views/CardPreviewView';
import { CartView } from './components/views/CartView';
import { CardBasketView } from './components/views/CardBasketView';
import { UserView } from './components/views/UserView';
import { ContactView } from './components/views/ContactView';

import { ProductPresenter } from './presenters/ProductPresenter';
import { CartPresenter } from './presenters/CartPresenter';
import { UserFormPresenter } from './presenters/UserFormPresenter';

// 📦 Базовые зависимости
const emitter = new EventEmitter();
const api = new Api(API_URL);
const modal = new Modal(document.querySelector('.modal')!);

// 📦 Модели
const catalogModel = new CatalogModel(emitter);
const cartModel = new CartModel(emitter);
const userModel = new UserModel(emitter);

// 👁️ Представления
const catalogView = new CardCatalogView('#card-catalog', (id: string) => {
  emitter.emit('card:select', { id });
});
const previewView = new CardPreviewView(
  document.querySelector('#card-preview') as HTMLTemplateElement,
  document.querySelector('.modal__content') as HTMLElement,
  CDN_URL
);


const cartView = new CartView(
  document.getElementById('modal-basket')!,
  emitter
);

const basketView = new CardBasketView(
  document.querySelector('#card-basket') as HTMLTemplateElement
);

const userView = new UserView(
  document.getElementById('modal-order')!,
  '#order'
);

const contactView = new ContactView(
  document.querySelector('#modal-contacts form') as HTMLFormElement
);


// 🎮 Презентеры
const productPresenter = new ProductPresenter(
  catalogModel,
  cartModel,
  catalogView,
  previewView,
  emitter,
  modal
);

const cartPresenter = new CartPresenter(
  cartModel,
  cartView,
  basketView,
  emitter,
  modal
);

const userFormPresenter = new UserFormPresenter(
  userModel,
  userView,
  contactView,
  cartModel,
  api,
  emitter,
  modal
);

// 🚀 Получение данных и запуск
api.getProductList().then((items) => {
  catalogModel.setItems(items);
});

productPresenter.init();
cartPresenter.init();

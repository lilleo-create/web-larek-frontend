import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { CartModel } from './models/CartModel';
import { CatalogModel } from './models/CatalogModel';
import { UserModel } from './models/UserModel';
import { CatalogView } from './components/views/CatalogView';
import { CartView } from './components/views/CartView';
import { UserView } from './components/views/UserView';
import { ICartItem } from './types/cart';
import { IProduct } from './types/product';
import { products } from './utils/products';

// Инициализация EventEmitter и моделей
const events = new EventEmitter();
const catalogModel = new CatalogModel(events);
const cartModel = new CartModel(events);
const userModel = new UserModel(events);

// View
const catalogElement = document.querySelector('.gallery') as HTMLElement;
const cartElement = document.querySelector('.basket__list') as HTMLElement;
const userForm = document.querySelector('form') as HTMLFormElement;

const catalogView = new CatalogView(catalogElement, (id: string) => {
    const product = catalogModel.getProductById(id);
    if (product) {
        cartModel.add({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
        });
    }
});

const cartView = new CartView(cartElement);
const userView = new UserView(userForm);

events.on('cart:change', (items: ICartItem[]) => cartView.render(items));

catalogModel.setProducts(products);

// Галерея товаров
function renderCatalog(products: IProduct[]): void {
    const gallery = document.querySelector('.gallery') as HTMLElement;
    const template = document.getElementById('card-catalog') as HTMLTemplateElement;
    gallery.innerHTML = '';

    products.forEach(product => {
        const card = template.content.cloneNode(true) as HTMLElement;
        const categoryEl = card.querySelector('.card__category') as HTMLElement;
        const titleEl = card.querySelector('.card__title') as HTMLElement;
        const priceEl = card.querySelector('.card__price') as HTMLElement;

        categoryEl.textContent = product.category;
        titleEl.textContent = product.title;
        priceEl.textContent = `${product.price} синапсов`;

        (card.querySelector('.gallery__item') as HTMLElement).dataset.id = product.id;

        gallery.appendChild(card);
    });
}

renderCatalog(products);

// Модалка на карточку товара
const modal = document.getElementById('modal-container') as HTMLElement;
const content = modal.querySelector('.modal__content') as HTMLElement;
const template = document.getElementById('card-preview') as HTMLTemplateElement;
const card = template.content.cloneNode(true) as HTMLElement;

document.querySelector('.gallery')?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest('.gallery__item') as HTMLElement;
  if (!button) return;

  const id = button.dataset.id;
  const product = products.find((p) => p.id === id);
  if (!product) return;

  const modal = document.getElementById('modal-container') as HTMLElement;
  const content = modal.querySelector('.modal__content') as HTMLElement;
  const template = document.getElementById('card-preview') as HTMLTemplateElement;
  const card = template.content.cloneNode(true) as HTMLElement;

  const categoryEl = card.querySelector('.card__category') as HTMLElement;
  categoryEl.classList.remove('card__category_soft', 'card__category_other', 'card__category_additional');
  if (product.category === 'soft-skill') {
      categoryEl.classList.add('card__category_soft');
  }
  if (product.category === 'другое') {
      categoryEl.classList.add('card__category_other');
  }
  if (product.category === 'дополнительное') {
      categoryEl.classList.add('card__category_additional');
  }
  categoryEl.textContent = product.category;

  (card.querySelector('.card__title') as HTMLElement).textContent = product.title;
  (card.querySelector('.card__text') as HTMLElement).textContent = product.description;
  (card.querySelector('.card__price') as HTMLElement).textContent = `${product.price} синапсов`;

  const img = card.querySelector('.card__image') as HTMLImageElement;
  img.src = product.image;
  img.alt = product.title;

  content.innerHTML = '';
  content.appendChild(card);
  openModal('modal-container');
});


document.querySelector('.header__basket')?.addEventListener('click', () => {
  openModal('modal-basket');
});

// По кнопке "Оформить"
document.querySelector('#modal-basket .button')?.addEventListener('click', () => {
  openModal('modal-order');
});

// По кнопке "Далее"
document.querySelector('#modal-order .button')?.addEventListener('click', () => {
  openModal('modal-contacts');
});

// По кнопке "За новыми покупками"
document.querySelector('.order-success__close')?.addEventListener('click', () => {
  openModal('modal-success');
});



// --- Вспомогательные функции ---
function openModal(id: string) {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('modal_active'));
    document.getElementById(id)?.classList.add('modal_active');
}

function setupModals(): void {
    document.querySelectorAll('.modal__close').forEach((button) => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.classList.remove('modal_active');
            }
        });
    });

    document.querySelectorAll('.modal').forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.remove('modal_active');
            }
        });
    });
}

setupModals();

// Просто чтобы TS не ругался
console.log(userModel);
console.log(catalogView);

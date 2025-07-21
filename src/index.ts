import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { CartModel } from './models/CartModel';
import { CatalogModel } from './models/CatalogModel';
import { UserModel } from './models/UserModel';
import { CatalogView } from './components/views/CatalogView';
import { CartView } from './components/views/CartView';
import { UserView } from './components/views/UserView';
import { ICartItem } from './types/cart';
import { products } from './utils/products';

const events = new EventEmitter();
const catalogModel = new CatalogModel(events);
const cartModel = new CartModel(events);
const userModel = new UserModel(events);

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
catalogView.render(products);

// ---------- Открытие модалки карточки ----------
const gallery = document.querySelector('.gallery') as HTMLElement;
const modalContent = document.querySelector('#modal-container .modal__content') as HTMLElement;
const templatePreview = document.querySelector('#card-preview') as HTMLTemplateElement;

gallery.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest('.gallery__item') as HTMLElement;
    if (!target) return;

    const id = target.dataset.id;
    if (!id) return;

    const product = products.find((p) => p.id === id);
    if (!product) return;

    const card = templatePreview.content.cloneNode(true) as HTMLElement;
    const categoryEl = card.querySelector('.card__category') as HTMLElement;
    categoryEl.textContent = product.category;
    categoryEl.classList.add(`card__category_${product.categoryType}`);

    (card.querySelector('.card__title') as HTMLElement).textContent = product.title;
    (card.querySelector('.card__text') as HTMLElement).textContent = product.description;
    (card.querySelector('.card__price') as HTMLElement).textContent = `${product.price} синапсов`;

    const img = card.querySelector('.card__image') as HTMLImageElement;
    img.src = product.image;
    img.alt = product.title;

    // Кнопка "Купить / Удалить из корзины"
    const buyButton = card.querySelector('.card__button') as HTMLButtonElement;

    function updateButtonState() {
        const isInCart = cartModel.getItems().some((item) => item.id === product.id);
        buyButton.textContent = isInCart ? 'Удалить из корзины' : 'Купить';
    }

    updateButtonState();

    buyButton.addEventListener('click', () => {
        const isInCart = cartModel.getItems().some((item) => item.id === product.id);
        if (isInCart) {
            cartModel.remove(product.id);
        } else {
            cartModel.add({
                id: product.id,
                title: product.title,
                price: product.price,
                quantity: 1,
            });
        }
        updateButtonState();
    });

    modalContent.innerHTML = '';
    modalContent.appendChild(card);

    openModal('modal-container');
});

// ---------- Корзина и прочее ----------
document.querySelector('.header__basket')?.addEventListener('click', () => {
    openModal('modal-basket');
});

document.querySelector('#modal-basket .button')?.addEventListener('click', () => {
    openModal('modal-order');
});

document.querySelector('#modal-order .button')?.addEventListener('click', () => {
    openModal('modal-contacts');
});

document.querySelector('.order-success__close')?.addEventListener('click', () => {
    openModal('modal-success');
});

// ---------- Модалки ----------
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

// ---------- Валидация формы ----------
const emailInput = userForm.querySelector('input[name="email"]') as HTMLInputElement;
const phoneInput = userForm.querySelector('input[name="phone"]') as HTMLInputElement;
const submitButton = userForm.querySelector('button[type="submit"]') as HTMLButtonElement;

function validateForm() {
    const isEmailValid = /^[\w-.]+@[\w-]+\.[a-z]{2,4}$/i.test(emailInput.value.trim());
    const isPhoneValid = /^\+7\d{10}$/.test(phoneInput.value.replace(/\D/g, ''));
    submitButton.disabled = !(isEmailValid && isPhoneValid);
}

emailInput.addEventListener('input', validateForm);
phoneInput.addEventListener('input', validateForm);

phoneInput.addEventListener('focus', () => {
    if (!phoneInput.value.startsWith('+7')) {
        phoneInput.value = '+7';
    }
});

phoneInput.addEventListener('input', () => {
    if (!phoneInput.value.startsWith('+7')) {
        phoneInput.value = '+7';
    }
});

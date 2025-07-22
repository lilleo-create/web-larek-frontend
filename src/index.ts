// ------------------------- Стили и модели -------------------------

import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { CartModel } from './models/CartModel';
import { CatalogModel } from './models/CatalogModel';
import { CatalogView } from './components/views/CatalogView';
import { CartView } from './components/views/CartView';
import { ICartItem } from './types/cart';
import { products } from './utils/products';

import {
    catalogElement,
    cartElement,
    basketCounter,
    gallery,
    modalContent,
    templatePreview,
    pageWrapper,
    modals,
    modalCloseButtons
} from './components/base/dom';

// ------------------------- Модели данных -------------------------

const events = new EventEmitter();
const catalogModel = new CatalogModel(events);
const cartModel = new CartModel(events);

// ------------------------- Отрисовка корзины, каталога, пользователя -------------------------

const catalogView = new CatalogView(catalogElement, () => { });
const cartView = new CartView(cartElement, events);

// ------------------------- События обновления корзины -------------------------

events.on('cart:change', (items: ICartItem[]) => {
    cartView.render(items);
    basketCounter.textContent = String(items.length);
});
events.on('item:remove', (event: { id: string }) => cartModel.remove(event.id));

// ------------------------- Первичная отрисовка -------------------------

catalogModel.setProducts(products);
catalogView.render(products);
cartView.render(cartModel.getItems());

cartElement.addEventListener('item:remove', (event: Event) => {
    const id = (event as CustomEvent).detail;
    cartModel.remove(id);
});

// ------------------------- Открытие/закрытие модальных окон -------------------------

function openModal(id: string) {
    modals.forEach(m => m.classList.remove('modal_active'));
    const modal = document.getElementById(id);
    modal?.classList.add('modal_active');
    pageWrapper?.classList.add('page__wrapper_locked');

    if (id === 'modal-order') initAddressForm();
    if (id === 'modal-contacts') initContactsForm();
}

function closeModal() {
    modals.forEach(modal => modal.classList.remove('modal_active'));
    pageWrapper?.classList.remove('page__wrapper_locked');
}

function setupModals(): void {
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => closeModal());
    });
    modals.forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeModal();
    });
}
setupModals();

// ------------------------- Галерея карточек товаров -------------------------

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
    (card.querySelector('.card__price') as HTMLElement).textContent =
        typeof product.price === 'number' ? `${product.price} синапсов` : `${product.price}`;
    const img = card.querySelector('.card__image') as HTMLImageElement;
    img.src = product.image;
    img.alt = product.title;
    const buyButton = card.querySelector('.card__button') as HTMLButtonElement;

    function updateButtonState() {
        const isInCart = cartModel.getItems().some((item) => item.id === product.id);
        buyButton.textContent = isInCart ? 'Удалить из корзины' : 'Купить';
    }

    updateButtonState();
    events.on('cart:change', updateButtonState);

    buyButton.addEventListener('click', () => {
        if (product.disabled) return;
        const isInCart = cartModel.getItems().some((item) => item.id === product.id);
        if (isInCart) {
            cartModel.remove(product.id);
        } else {
            cartModel.add({
                id: product.id,
                title: product.title,
                price: typeof product.price === 'number' ? product.price : 0,
                quantity: 1,
            });
        }
        updateButtonState();
    });

    modalContent.innerHTML = '';
    modalContent.appendChild(card);
    openModal('modal-container');
});

// ------------------------- Кнопка корзины в хедере -------------------------

document.querySelector('.header__basket')?.addEventListener('click', () => {
    openModal('modal-basket');
});

// ------------------------- Переходы между модалками -------------------------

document.querySelectorAll('[data-next]')?.forEach(button => {
    button.addEventListener('click', (event) => {
        const target = event.target as HTMLButtonElement;
        const nextId = target.dataset.next;
        closeModal();
        if (nextId) openModal(`modal-${nextId}`);
    });
});

// ------------------------- Форма адреса доставки -------------------------

function initAddressForm() {
    const addressForm = document.querySelector('#modal-order .form') as HTMLFormElement;
    if (!addressForm) return;

    const onlineButton = addressForm.querySelector('button[name="card"]') as HTMLButtonElement;
    const cashButton = addressForm.querySelector('button[name="cash"]') as HTMLButtonElement;
    const addressInput = addressForm.querySelector('input[name="address"]') as HTMLInputElement;
    const addressError = addressForm.querySelector('.modal__actions .form__error') as HTMLElement;
    const paymentInput = addressForm.querySelector('input[name="payment"]') as HTMLInputElement;
    const nextButton = addressForm.querySelector('.modal__actions .button') as HTMLButtonElement;

    let paymentType: 'online' | 'cash' | '' = '';

    function updatePaymentSelection(selected: 'online' | 'cash') {
        paymentType = selected;
        onlineButton.classList.remove('button_alt-active');
        cashButton.classList.remove('button_alt-active');
        if (selected === 'online') onlineButton.classList.add('button_alt-active');
        if (selected === 'cash') cashButton.classList.add('button_alt-active');

        paymentInput.value = selected;
        validateAddressForm();
    }

    onlineButton.addEventListener('click', () => updatePaymentSelection('online'));
    cashButton.addEventListener('click', () => updatePaymentSelection('cash'));

    function validateAddressForm() {
        const isAddressValid = addressInput.value.trim().length > 0;
        const isPaymentSelected = paymentType === 'online' || paymentType === 'cash';
        nextButton.disabled = !(isAddressValid && isPaymentSelected);
        addressError.style.display = isAddressValid ? 'none' : 'block';
    }

    addressInput.addEventListener('input', validateAddressForm);
    validateAddressForm();

    nextButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (!addressInput.value.trim()) {
            addressError.style.display = 'block';
        } else {
            closeModal();
            openModal('modal-contacts');
        }
    });
}

// ------------------------- Форма контактов -------------------------

function initContactsForm() {
    const contactsForm = document.querySelector('#modal-contacts .form') as HTMLFormElement;
    if (!contactsForm) return;

    const emailInput = contactsForm.querySelector('input[placeholder="Введите Email"]') as HTMLInputElement;
    const phoneInput = contactsForm.querySelector('input[placeholder="+7 ("]') as HTMLInputElement;
    const submitButton = contactsForm.querySelector('button[type="submit"]') as HTMLButtonElement;

    function maskPhoneInput() {
        let value = phoneInput.value.replace(/\D/g, '');
        if (value.startsWith('8')) {
            value = '7' + value.slice(1);
        }
        if (!value.startsWith('7')) {
            value = '7' + value;
        }

        const template = '+7 (___) ___-__-__';
        let i = 0;
        phoneInput.value = template.replace(/./g, (char) =>
            /[_\d]/.test(char) && i < value.length ? value.charAt(i++) : char
        );
    }

    function validateContactsForm() {
        const isEmailValid = /^[\w-.]+@[\w-]+\.[a-z]{2,4}$/i.test(emailInput.value.trim());
        const isPhoneValid = /\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}/.test(phoneInput.value);
        submitButton.disabled = !(isEmailValid && isPhoneValid);
    }

    emailInput.addEventListener('input', validateContactsForm);
    phoneInput.addEventListener('input', () => {
        maskPhoneInput();
        validateContactsForm();
    });

    phoneInput.addEventListener('focus', () => {
        if (!phoneInput.value.startsWith('+7')) {
            phoneInput.value = '+7 (';
        }
    });

    contactsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!submitButton.disabled) {
            cartModel.clear();
            events.emit('cart:change', cartModel.getItems());
            closeModal();
            openModal('modal-success');
        }
    });

    // ------------------------- Заказ успешно оформлен -------------------------

    const successCloseButton = document.querySelector('.order-success__close') as HTMLButtonElement;
    if (successCloseButton) {
        successCloseButton.addEventListener('click', () => {
            closeModal();
        });
    }

    validateContactsForm();
}

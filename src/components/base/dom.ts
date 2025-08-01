// Только DOM-элементы

export const catalogElement = document.querySelector('.gallery') as HTMLElement;
export const cartElement = document.querySelector('.basket__list') as HTMLElement;
export const userForm = document.querySelector('#modal-contacts .form') as HTMLFormElement;

export const gallery = document.querySelector('.gallery') as HTMLElement;
export const templatePreview = document.querySelector('#card-preview') as HTMLTemplateElement;
export const pageWrapper = document.querySelector('.page__wrapper') as HTMLElement;
export const modalContainer = document.getElementById('modal-container') as HTMLElement;

export const priceElement = document.querySelector('.basket__price') as HTMLElement;
export const orderButton = document.querySelector('.basket .button[data-next="order"]') as HTMLButtonElement;

export const catalogTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
export const basketTemplate = document.getElementById('card-basket') as HTMLTemplateElement;

export const addressForm = document.querySelector('#modal-order .form') as HTMLFormElement;

// 🔧 Новое: безопасный способ получить элемент счётчика
export const getBasketCounter = () =>
	document.querySelector('.header__basket-counter') as HTMLElement;

export const basketElement = document.querySelector('#modal-basket .basket') as HTMLElement;

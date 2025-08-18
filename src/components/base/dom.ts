// только DOM-элементы

export const catalogElement = document.querySelector('.gallery') as HTMLElement;
export const cartElement = document.querySelector('.basket__list') as HTMLElement;
export const userForm = document.querySelector('#modal-contacts .form') as HTMLFormElement;
export const basketCounter = document.querySelector('.header__basket-counter') as HTMLElement;

export const gallery = document.querySelector('.gallery') as HTMLElement;
export const templatePreview = document.querySelector('#card-preview') as HTMLTemplateElement;
export const pageWrapper = document.querySelector('.page__wrapper') as HTMLElement;
export const modalContainer = document.getElementById('modal-container') as HTMLElement;


export const priceElement = document.querySelector('.basket__price') as HTMLElement;
export const orderButton = document.querySelector('.basket .button[data-next="order"]') as HTMLButtonElement;

export const catalogTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
export const basketTemplate =
  document.querySelector<HTMLTemplateElement>('#basket')
  ?? (() => { throw new Error('Basket template not found'); })();

export const cardBasketTemplate =
  document.querySelector<HTMLTemplateElement>('#card-basket')
  ?? (() => { throw new Error('Card basket template not found'); })();


  
export const addressForm = document.querySelector('#modal-order .form') as HTMLFormElement;

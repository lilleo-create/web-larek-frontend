import { IProduct } from '../types/product';

export const products: IProduct[] = [
    {
        id: '1',
        title: '+1 час в сутках',
        description: 'Если планируете решать задачи в тренажёре, берите два.',
        category: 'софт-скил',
        categoryType: 'soft',
        price: 750,
        image: new URL('../images/5_Dots.png', import.meta.url).toString()
    },
    {
        id: '2',
        title: 'HEX-леденец',
        description: 'Лизните этот леденец, чтобы мгновенно запоминать и узнавать любой цветовой код CSS.',
        category: 'софт-скил',
        categoryType: 'soft',
        price: 1450,
        image: new URL('../images/Shell-1.png', import.meta.url).toString()
    },
    {
        id: '3',
        title: 'Мамка-таймер',
        description: 'Будет стоять над душой и не давать прокрастинировать.',
        category: 'другое',
        categoryType: 'other',
        price: 'Бесценно',
        disabled: true,
        image: new URL('../images/Asterisk_3.png', import.meta.url).toString()
    },
    {
        id: '4',
        title: 'Фреймворк куки судьбы',
        description: 'Откройте эти куки, чтобы узнать, какой фреймворк вы должны изучить дальше.',
        category: 'дополнительное',
        categoryType: 'additional',
        price: 2500,
        image: new URL('../images/Soft_Flower.png', import.meta.url).toString()
    },
    {
        id: '5',
        title: 'Кнопка «Замьютить кота»',
        description: 'Если орёт кот, нажмите кнопку.',
        category: 'кнопка',
        categoryType: 'button',
        price: 2000,
        image: new URL('../images/Cat.png', import.meta.url).toString()
    },
    {
        id: '6',
        title: 'БЭМ-пилюлька',
        description: 'Чтобы научиться правильно называть модификаторы, без этого не обойтись.',
        category: 'другое',
        categoryType: 'other',
        price: 1500,
        image: new URL('../images/Frame_307.png', import.meta.url).toString()
    },
    {
        id: '7',
        title: 'Портативный телепорт',
        description: 'Измените локацию для поиска работы.',
        category: 'другое',
        categoryType: 'other',
        price: 100000,
        image: new URL('../images/Polygon.png', import.meta.url).toString()
    },
    {
        id: '8',
        title: 'Микровселенная в кармане',
        description: 'Даст время для изучения React, ООП и бэкенда',
        category: 'другое',
        categoryType: 'other',
        price: 150000,
        image: new URL('../images/Butterfly.png', import.meta.url).toString()
    },
    {
        id: '9',
        title: 'UI/UX-карандаш',
        description: 'Очень полезный навык для фронтендера. Без шуток.',
        category: 'хард-скил',
        categoryType: 'hard',
        price: 10000,
        image: new URL('../images/Leaf.png', import.meta.url).toString()
    },
    {
        id: '7',
        title: 'Бэкенд-антистресс',
        description: 'Сжимайте мячик, чтобы снизить стресс от тем по бэкенду.',
        category: 'другое',
        categoryType: 'other',
        price: 1000,
        image: new URL('../images/Mithosis.png', import.meta.url).toString()
    }
];

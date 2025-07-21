import { IProduct } from '../types/product';

export const products: IProduct[] = [
    {
        id: '1',
        title: '+1 час в сутках',
        description: 'Если планируете решать задачи в тренажёре, берите два.',
        category: 'софт-скил',
        categoryType: 'soft',
        price: 2500,
        image: new URL('../images/5_Dots.png', import.meta.url).toString()
    },
    {
        id: '2',
        title: 'HEX-леденец',
        description: 'Лизните этот леденец, чтобы мгновенно запоминать и узнавать любой цветовой код CSS.',
        category: 'софт-скил',
        categoryType: 'soft',
        price: 750,
        image: new URL('../images/Asterisk_3.png', import.meta.url).toString()
    },
    {
        id: '3',
        title: 'Мамка-таймер',
        description: 'Будет стоять над душой и не давать прокрастинировать.',
        category: 'другое',
        categoryType: 'other',
        price: 150000,
        image: new URL('../images/Butterfly.png', import.meta.url).toString()
    }
];

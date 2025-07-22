export interface IProduct {
    id: string;
    title: string;
    description: string;
    category: string;
    categoryType: 'soft' | 'other' | 'additional' | 'button' | 'hard';
    price: number | string;
    disabled?: boolean;
    image: string;
}

export interface IProduct {
    id: string;
    title: string;
    description: string;
    category: string; // для отображения пользователю (софт-скил, другое, дополнительное)
    categoryType: 'soft' | 'other'; // для css классов
    price: number;
    image: string;
}

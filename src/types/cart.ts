

export interface ICartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

export type ICartItemInput = Omit<ICartItem, 'quantity'>;

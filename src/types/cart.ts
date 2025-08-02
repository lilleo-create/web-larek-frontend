export interface ICartItem {
	id: string;
	title: string;
	price: number;
	quantity?: number;
}

export interface ICartItemInput {
	id: string;
	title: string;
	price: number;
}

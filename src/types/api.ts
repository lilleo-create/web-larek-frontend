export interface IOrder {
	payment: string;
	address: string;
	email: string;
	phone: string;
	items: string[];
}

export interface IOrderResult {
	id: string;
	total: number;
}

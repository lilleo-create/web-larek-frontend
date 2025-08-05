export interface IApiProductResponse {
	id: string;
	title: string;
	description: string;
	category: string;
	price: number;
	image: string;
}

// Внутреннее представление товара в приложении
export interface IProduct extends IApiProductResponse {
	inCart?: boolean;
	disabled?: boolean;
	selected?: boolean;
}
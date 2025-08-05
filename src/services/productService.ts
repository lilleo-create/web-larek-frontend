import { Api } from '../components/base/api';
import { IApiProductResponse, IProduct } from '../types/product';

export async function fetchProducts(api: Api): Promise<IProduct[]> {
	const raw: IApiProductResponse[] = await api.getProductList();

	return raw.map((p) => ({
		...p,
		inCart: false,
		disabled: false,
		selected: false
	}));
}

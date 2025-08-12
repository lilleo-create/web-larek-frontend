export interface IApiProductResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image: string;
}

export interface ApiListResponse<T> { total: number; items: T[] }


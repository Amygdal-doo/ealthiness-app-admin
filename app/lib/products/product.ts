/* -------------------------------------------------------------------------- */
/*  Product search (GET /v1/products/search)                                  */
/* -------------------------------------------------------------------------- */

export interface ProductImage {
  name: string;
  extension: string;
  createdAt: string;
  url: string;
}

/** A single product as returned by the search endpoint. */
export interface Product {
  id: string;
  productId: string;
  title: string;
  brand: string;
  stockStatus: string;
  rating: number;
  reviewCount: number;
  images: ProductImage[];
}

export interface ProductSearchResponse {
  limit: number;
  page: number;
  pages: number;
  total: number;
  results: Product[];
}

export interface ProductSearchQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

/** Minimum characters before the product search fires. */
export const PRODUCT_SEARCH_MIN_CHARS = 3;

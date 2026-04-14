import { api } from "../axios/axios-instance";
import { env } from "../config/env";
import { ProductsResponse } from "./product.schema";

export default async function getProducts(): Promise<ProductsResponse> {
  const response = await api.get('/products');
  const data: ProductsResponse = response.data;
  return data;
}
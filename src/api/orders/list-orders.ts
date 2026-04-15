import { api } from "../../axios/axios-instance.js";
import { OrderListItem, OrdersResponse } from "./order.schema.js";

export default async function listOrders(): Promise<OrderListItem[]> {
  const response = await api.get("/orders");
  const data: OrdersResponse = response.data;
  return data.orders;
}

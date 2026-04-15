import { api } from "../../axios/axios-instance.js";
import { CreateOrderInput } from "./order.schema.js";

export default async function createOrder(data: CreateOrderInput): Promise<void> {
  await api.post("/orders", data);
}

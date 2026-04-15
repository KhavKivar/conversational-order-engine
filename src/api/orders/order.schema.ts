export type OrderLine = {
  lineId: number;
  productId: number;
  pricePerUnit: number;
  quantity: number;
  lineTotal: number;
  productName: string | null;
  buyPriceSupplier: number;
};

export type OrderListItem = {
  orderId: number;
  createdAt: string;
  clientId: number;
  localName: string | null;
  phone: string | null;
  address: string | null;
  lines: OrderLine[];
  purchaseOrderId: number | null;
  status: "pending" | "paid" | "delivered" | "delivered_paid" | "cancelled";
};

export type CreateOrderInput = {
  clientId: number;
  items: Array<{
    productId: number;
    pricePerUnit: number;
    quantity: number;
  }>;
};

export type OrdersResponse = { orders: OrderListItem[] };

import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { OrderListItem } from "../../../api/orders/order.schema.js";
import listOrders from "../../../api/orders/list-orders.js";
import getClientByPhoneId from "../../../api/client/get-client-by-phone-id.js";

export const listAllOrders: GraphNode<typeof State> = async (state) => {
  const sender = state.messages[0]?.additional_kwargs?.sender as string | undefined;

  if (!sender) {
    return { messages: [{ role: "ai", content: "No se pudo identificar el remitente." }] };
  }

  const client = await getClientByPhoneId(sender);
  if (!client) {
    return { messages: [{ role: "ai", content: "No se encontró un cliente asociado a este número." }] };
  }

  const allOrders: OrderListItem[] = await listOrders();
  const clientOrders = allOrders.filter((order) => order.clientId === client.id);

  if (clientOrders.length === 0) {
    return { messages: [{ role: "ai", content: "No tenés pedidos registrados." }] };
  }

  let ordersMessage = "Tus pedidos:\n\n";
  clientOrders.forEach((order) => {
    ordersMessage += orderToWhatsappMessage(order) + "\n";
  });

  return { messages: [{ role: "ai", content: ordersMessage }] };
};

const orderToWhatsappMessage = (order: OrderListItem): string => {
  let message = `Pedido ID: ${order.orderId} | Estado: ${order.status}\nProductos:\n`;
  order.lines.forEach((item) => {
    message += ` - ${item.productName} x${item.quantity} = $${item.pricePerUnit * item.quantity}\n`;
  });
  const total = order.lines.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  message += `Total: $${total}\n`;
  return message;
};

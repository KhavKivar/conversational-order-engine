import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { listOrders, OrderListItem } from "../../../../backend/src/services/orders.js";

export const listAllOrders: GraphNode<typeof State> = async () => {
  const getAllOrders:OrderListItem[] = await listOrders(); 
  if(getAllOrders.length === 0){
    return { messages: [{ role: "ai", content: "No hay pedidos disponibles." }] };
  }

  let ordersMessage = "Lista de todos los pedidos:\n\n";
  getAllOrders.forEach((order) => { 
    ordersMessage += orderToWhatsappMessage(order) + "\n";
  });

  return { messages: [{ role: "ai", content: ordersMessage }] };         
};

const orderToWhatsappMessage = (order: OrderListItem): string => {
  let message = `Pedido ID: ${order.orderId}\nCliente: ${order.clientName}\nProductos:\n`;
  order.lines.forEach((item) => {
    message += ` - ${item.productName} x${item.quantity}  = $${item.pricePerUnit * item.quantity}\n`;
  });
  const total = order.lines.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  message += `Total: $${total}\n`;
  return message;
}

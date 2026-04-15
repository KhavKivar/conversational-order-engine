import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";

export const botCapabilitiesNode: GraphNode<typeof State> = async () => {
  const responseMessage = `¡Hola! Soy tu asistente de ventas de vasvani app. 🤖🏰

Puedo ayudarte con lo siguiente:
✅ *Ver precios:* Pedime la "lista de precios" o consultame por un producto específico (ej: "¿Cuánto sale el Jack Daniels?").
✅ *Hacer pedidos:* Decime qué querés comprar y armamos el pedido.
✅ *Mis pedidos:* Podés consultar el estado de tus compras anteriores.
✅ *Registrarte:* Si es tu primera vez, te ayudo a darte de alta como cliente.

¿En qué puedo ayudarte hoy?`;

  return { 
    messages: [{ role: "ai", content: responseMessage }],
    activeIntent: null 
  };
};

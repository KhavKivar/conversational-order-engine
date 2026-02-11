import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";

export const cancelOrder: GraphNode<typeof State> = async () => {
  return { messages: [{ role: "ai", content: "Pedido cancelado." }] };
};

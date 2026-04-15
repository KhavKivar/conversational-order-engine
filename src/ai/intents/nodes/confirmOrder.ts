import { GraphNode, StateSnapshot } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { CreateOrderInput } from "../../../api/orders/order.schema.js";
import createOrder from "../../../api/orders/create-order.js";

export const confirmOrder: GraphNode<typeof State> = async (state) => {
  const messages = state.messages;
  const sender = messages[0]?.additional_kwargs?.sender as string | undefined;
  const phoneNumber = messages[0]?.additional_kwargs?.phone as string | undefined;

  if (!sender || !phoneNumber) {
    return {
      messages: [
        {
          role: "ai",
          content: "No se pudo obtener el número de teléfono del remitente.",
        },
      ],
    };
  }

  const getOrder = await getOrderFromHistory(sender);
  if (!getOrder) {
    return {
      messages: [
        {
          role: "ai",
          content: "No se encontró ningún pedido para confirmar.",
        },
      ],
    };
  }

  await createOrder(getOrder);

  return { messages: [{ role: "ai", content: "Pedido confirmado." }] };
};

const getOrderFromHistory = async (sender: string): Promise<CreateOrderInput | null> => {
  const config = { configurable: { thread_id: sender } };

  const { graph } = await import("../../graph/strategy.js");
  const lastSnapshot: StateSnapshot = (
    await graph.getStateHistory(config).next()
  ).value;
  const lastSnapshotNodes = lastSnapshot.values.messages;
  console.log("Last snapshot nodes:", lastSnapshotNodes);

  const checkLastOrderNode = Array.isArray(lastSnapshotNodes)
    ? lastSnapshotNodes.find(
        (node) =>
          node.content &&
          node.content.includes("Me puedes confirmar el siguiente pedido?"),
      )
    : null;

  if (checkLastOrderNode === null) {
    return null;
  }
  console.log(checkLastOrderNode.additional_kwargs.order);
  console.log("Check last order node:", checkLastOrderNode);

  const order: CreateOrderInput = checkLastOrderNode.additional_kwargs.order;
  return order;
};

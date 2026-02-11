import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { State } from "../state/schema.js";

import { toMessageText } from "../utils/message.js";

import {
  listPriceNode,
  listAllOrders,
  makeOrderNode,
  registerClientNode,
  userIntentNode,
  confirmOrder,
  cancelOrder,
} from "../intents/classifier.js";


const conditionalEdge = (state: { messages: Array<{ content?: unknown }> }) => {
  const stateMessages = state.messages;
  const lastMessage = stateMessages[stateMessages.length - 1];
  const intent = toMessageText(lastMessage?.content as string | undefined)
    .trim()
    .toLowerCase();

  if (intent === "list_prices") {
    return "list_prices";
  }
  if (intent === "list_orders") {
    return "list_orders";
  }
  if (intent === "place_order") {
    return "place_order";
  }
  if(intent === "register_client"){
    return "register_client";
  }
  if (intent === "confirm_order") {
    return "confirm_order";
  }
  if (intent === "cancel_order") {
    return "cancel_order";
  }
  return "end";
};

const checkpointer = new MemorySaver();


export const graph = new StateGraph(State)
  .addNode("user_intent", userIntentNode)
  .addNode("list_prices", listPriceNode)
  .addNode("list_orders", listAllOrders)
  .addNode("place_order", makeOrderNode)
  .addNode("register_client", registerClientNode)
  .addNode("confirm_order", confirmOrder)
  .addNode("cancel_order", cancelOrder)
  .addEdge(START, "user_intent")
  .addConditionalEdges("user_intent", conditionalEdge, {
    list_prices: "list_prices",
    list_orders: "list_orders",
    register_client: "register_client",
    place_order: "place_order",
    confirm_order: "confirm_order",
    cancel_order: "cancel_order",
    end: END,
  })
  .addEdge("list_prices", END)
  .addEdge("list_orders", END)
  .addEdge("place_order", END)
  .addEdge("register_client", END)
  .addEdge("confirm_order", END)
  .addEdge("cancel_order", END)
  .compile({checkpointer});

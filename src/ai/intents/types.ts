export enum UserIntentType {
  LIST_PRICES = "list_prices",
  PLACE_ORDER = "place_order",
  LIST_ORDERS = "list_orders",
  REGISTER_CLIENT = "register_client",
  CONFIRM_ORDER = "confirm_order",
  CANCEL_ORDER = "cancel_order",
  NOT_RELATED = "not_related",
}

interface NodeOutput{
  role: "ai" | "user";
  content: string;
}

export interface HistorialNodeOutput {
  messages: NodeOutput[];
}

import { readFileSync } from "node:fs";
import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { ai } from "../../providers/gemini.js";
import { UserIntentType } from "../types.js";
import { toMessageText } from "../../utils/message.js";

const systemInstructionUserIntent = readFileSync(
  new URL("../prompts/user-intent.xml", import.meta.url),
  "utf8"
);

export const userIntentNode: GraphNode<typeof State> = async (state) => {
  const messages = state.messages;
  if (messages.length === 0) {
    throw new Error("No messages found in state");
  }
  const userMessage = messages[messages.length - 1].content;
  const userMessageText = toMessageText(userMessage);

  const parseMessage = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: { systemInstruction: systemInstructionUserIntent, temperature: 0 },
    contents: userMessageText,
  });

  const intent = parseMessage.text as string;
  let intentType: UserIntentType;

  switch (intent) {
    case "list_prices":
      intentType = UserIntentType.LIST_PRICES;
      break;
    case "place_order":
      intentType = UserIntentType.PLACE_ORDER;
      break;
    case "list_orders":
      intentType = UserIntentType.LIST_ORDERS;
      break;
    case "register_client":
      intentType = UserIntentType.REGISTER_CLIENT;
      break;
    case "confirm_order":
      intentType = UserIntentType.CONFIRM_ORDER;
      break;
    case "cancel_order":
      intentType = UserIntentType.CANCEL_ORDER;
      break;
    default:
      intentType = UserIntentType.NOT_RELATED;
  }

  return { messages: [{ role: "ai", content: intentType }] };
};

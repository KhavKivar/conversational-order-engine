import { HumanMessage } from "@langchain/core/messages";
import { graph } from "../ai/graph/strategy.js";


export async function runAiIntent(
  message: string,
  sender: string,
  senderPhone?: string
): Promise<string> {

  
  const respond = await graph.invoke({
    messages: [
      new HumanMessage({
        content: message,
        additional_kwargs: { sender:sender, phone: senderPhone },
      }),
    ],
  
  
  }, { configurable: { thread_id: sender } });

  const last = respond.messages[respond.messages.length - 1];
  const content = last?.content ?? "";

  return typeof content === "string" ? content : JSON.stringify(content);
}

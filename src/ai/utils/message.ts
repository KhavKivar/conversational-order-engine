import type { MessageContent } from "@langchain/core/messages";

export function toMessageText(content: MessageContent | undefined) {
  if (typeof content === "string") {
    return content;
  }

  if (content == null) {
    return "";
  }

  return JSON.stringify(content);
}

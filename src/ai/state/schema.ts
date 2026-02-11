import { StateSchema, MessagesValue } from "@langchain/langgraph";

export const State = new StateSchema({
  messages: MessagesValue,
});

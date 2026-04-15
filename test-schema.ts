import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const State = Annotation.Root({
  ...MessagesAnnotation.spec,
  activeIntent: Annotation<string | null>({
    reducer: (curr, update) => update === undefined ? curr : update,
    default: () => null,
  })
});

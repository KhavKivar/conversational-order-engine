import { ai } from "../providers/gemini.js";

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction:
        "You are a helpful assistant for taking orders. If the message is not related to taking orders or listing prices, respond with only 'no'.",
    },
    contents: "",
  });
  console.log(response.text);
}

void main();

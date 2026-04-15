import { readFileSync } from "node:fs";
import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { ai } from "../../providers/gemini.js";
import { toMessageText } from "../../utils/message.js";
import {
  getMissingClientFields,
  safeParseClientPayload,
} from "../utils/clientPayload.js";
import createClient from "../../../api/client/create-client.js";
import { ClientResponse } from "../../../api/client/client.schema.js";

const systemInstructionCreateClient = readFileSync(
  new URL("../prompts/create-client.xml", import.meta.url),
  "utf8"
);

export const registerClientNode: GraphNode<typeof State> = async (state) => {
  const { messages } = state;
  const userMessageText = messages
    .map((m) => toMessageText(m.content))
    .join("\n");
  console.log("Context for create client:", userMessageText);
  const parseMessageToCreateClient = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: { systemInstruction: systemInstructionCreateClient, temperature: 0 },
    contents: userMessageText,
  });
  console.log(
    "Parsed create client message:",
    parseMessageToCreateClient.text
  );

  const payloadText = (parseMessageToCreateClient.text ?? "").trim();
  const payload = safeParseClientPayload(payloadText) ?? {};
  const missingFields = getMissingClientFields(payload);

  if (missingFields.length === 3) {
    return {
      messages: [
        {
          role: "ai",
          content:
            "Necesito los siguientes datos: nombre, nombre del local y direccion para poder registrarte.",
        },
      ],
      activeIntent: "register_client",
    };
  }

  if (missingFields.length > 0) {
    return {
      messages: [
        {
          role: "ai",
          content: `Falta ${missingFields.join(", ")}. Envia: nombre, nombre del local y direccion.`,
        },
      ],
      activeIntent: "register_client",
    };
  }

  const lastHumanMessage = [...messages].reverse().find(m => m.additional_kwargs?.sender);
  const sender = lastHumanMessage?.additional_kwargs?.sender as string | undefined;
  const phoneNumber = lastHumanMessage?.additional_kwargs?.phone as string | undefined;
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
 

  const created = await createClient({
    name: payload.name?.trim() ?? "",
    localName: payload.localName?.trim() ?? "",
    address: payload.address?.trim() ?? "",
    phone: phoneNumber,
    phoneId: sender,
  });

  if (typeof created === "string") {
    return {
      messages: [
        {
          role: "ai",
          content: created,
        },
      ],
      activeIntent: null,
    };
  }
  
  return {
    messages: [
      {
        role: "ai",
        content: `Cliente registrado: ${(created as ClientResponse).client.localName ?? ""}.`,
      },
    ],
    activeIntent: null,
  };
};

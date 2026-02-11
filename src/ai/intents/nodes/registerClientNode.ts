import { readFileSync } from "node:fs";
import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { ai } from "../../providers/gemini.js";
import { toMessageText } from "../../utils/message.js";
import { findOrCreateClient } from "../../../../backend/src/services/clients.js";
import {
  getMissingClientFields,
  safeParseClientPayload,
} from "../utils/clientPayload.js";

const systemInstructionCreateClient = readFileSync(
  new URL("../prompts/create-client.xml", import.meta.url),
  "utf8"
);

export const registerClientNode: GraphNode<typeof State> = async (state) => {
  const messages = state.messages;
  const stateMessage = messages[0].content;
  const userMessageText = toMessageText(stateMessage);
  console.log("User message for create client:", userMessageText);
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
    };
  }

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
 

  const created = await findOrCreateClient({
    name: payload.name?.trim() ?? "",
    localName: payload.localName?.trim() ?? "",
    address: payload.address?.trim() ?? "",
    phone: phoneNumber,
    phoneId: sender,
  });

  if (!created.isNew) {
    return {
      messages: [
        {
          role: "ai",
          content: `Ya estás registrado como cliente: ${created.client.name ?? ""}, nombre del local: ${created.client.localName ?? ""} y telefono ${created.client.phone ?? ""}.`,
        },
      ],
    };
  }   

  return {
    messages: [
      {
        role: "ai",
        content: `Cliente registrado: ${created.client.name ?? ""}.`,
      },
    ],
  };
};

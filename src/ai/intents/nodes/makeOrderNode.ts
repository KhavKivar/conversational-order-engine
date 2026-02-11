import { readFileSync } from "node:fs";
import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { ai } from "../../providers/gemini.js";
import { toMessageText } from "../../utils/message.js";

import { CreateOrderInput } from "../../../../backend/src/services/orders.js";
import { listProducts, ProductListItem } from "../../../../backend/src/services/products.js";
import { getClientByPhoneId, OptionalClient } from "../../../../backend/src/services/clients.js";

const systemInstructionOrder = readFileSync(
  new URL("../prompts/order-parse.xml", import.meta.url),
  "utf8"
);

interface OrderItems {
  items: Array<{ id: number; quantity: number }>;
  message: string;
  status: "positive" | "medium" | "negative";
}

export const makeOrderNode: GraphNode<typeof State> = async (state) => {
  const messages = state.messages;
  const stateMessage = messages[0].content;
  const sender: string =
    typeof messages[0]?.additional_kwargs?.sender === "string"
      ? messages[0].additional_kwargs.sender
      : "";

  if (sender.trim() === "") {
    return {
      messages: [
        {
          role: "ai",
          content:
            "Para hacer un pedido necesitas registrarte, escribre regristarte para saber mas",
        },
      ],
    };
  }

  console.log(`Checking client for sender: ${sender}`);
  const clientExist: OptionalClient = await getClientByPhoneId(sender);
  if (!clientExist) {
    return {
      messages: [
        {
          role: "ai",
          content:
            "No se encontró un cliente asociado a este número. Por favor, regístrate antes de realizar un pedido.",
        },
      ],
    };
  }

  console.log(`raw order: ${toMessageText(stateMessage)}`);

  const parseResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: { systemInstruction: systemInstructionOrder, temperature: 0 },
    contents: toMessageText(stateMessage),
  });
  console.log("Raw ai response for order parsing:", parseResponse.text);
  const raw = (parseResponse.text ?? "").trim();
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  let parsed: OrderItems;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return {
      messages: [
        {
          role: "ai",
          content: "Error al procesar el pedido. Por favor, intenta nuevamente.",
        },
      ],
    };
  }
  console.log("Parsed order message:", parseResponse.text);
  const incompleteHandling = handleIncompleteOrder(parsed);
  if (incompleteHandling) {
    return incompleteHandling;
  }


  const getAllProduct: ProductListItem[] = await listProducts();
  const client: OptionalClient = await getClientByPhoneId(sender);
  if (!client) {
    return {
      messages: [
        {
          role: "ai",
          content: "Error en el sistema, no pude encontrar el numero",
        },
      ],
    };
  }

  const orderCreateDto: CreateOrderInput = {
    clientId: client.id,
    items: [],
  };

  for (const item of parsed.items) {
    const product = getAllProduct.find((p) => p.id === item.id);
    if (product) {
      orderCreateDto.items.push({
        productId: product.id,
        pricePerUnit: product.sellPriceClient,
        quantity: item.quantity,
      });
    }
  }

  let createMessage =
    "Me puedes confirmar el siguiente pedido?, dime si quieres proceder o cancelar:\n";

  for (const orderItem of orderCreateDto.items) {
    const product = getAllProduct.find((p) => p.id === orderItem.productId);
    if (!product) {
      continue;
    }
    createMessage += `- ${product.name}: ${orderItem.quantity} x $${orderItem.pricePerUnit} = $${orderItem.quantity * orderItem.pricePerUnit}\n`;
  }

  createMessage += `Total: $${orderCreateDto.items.reduce(
    (sum, item) => sum + item.pricePerUnit * item.quantity,
    0
  )}\n`;
  createMessage +=
    "Responde con 'confirmar' para proceder o 'cancelar' para cancelar el pedido.";

  return {
    messages: [
      {
        role: "ai",
        content: createMessage,
        additional_kwargs: { order:  orderCreateDto }
      },
    ],
  };
};

const handleIncompleteOrder = (parsed: OrderItems) => {
  if (parsed.status === "negative") {
    return {
      messages: [
        {
          role: "ai",
          content: parsed.message || "No se pudo procesar el pedido.",
        },
      ],
    };
  }
  if (parsed.status === "medium") {
    return {
      messages: [
        {
          role: "ai",
          content: `Hay ambigüedades en tu pedido: ${parsed.message}. Por favor, acláralas e intenta nuevamente.`,
        },
      ],
    };
  }

  if (parsed.items.length === 0) {
    return {
      messages: [
        {
          role: "ai",
          content: "No se encontraron artículos válidos en tu pedido.",
        },
      ],
    };
  }

  if (parsed.items.some((item) => item.quantity <= 0)) {
    return {
      messages: [
        {
          role: "ai",
          content: "No se encontraron artículos válidos en tu pedido.",
        },
      ],
    };
  }
  return null;
};

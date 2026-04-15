import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { ai } from "../../providers/gemini.js";
import getProducts from "../../../api/products/get-products.js";
import { toMessageText } from "../../utils/message.js";

export const getProductPriceNode: GraphNode<typeof State> = async (state) => {
  const { messages } = state;
  
  // ⚠️ FIX: LangGraph a veces usa 'human' o 'user'. Buscamos de forma más flexible.
  // Buscamos cualquier mensaje que NO sea del sistema ni de la IA (label de intención)
  const userMessages = messages.filter(m => 
    (m as any).role === "user" || 
    (m as any).type === "human" || 
    (m as any)._getType?.() === "human"
  );

  // Si por alguna razón el filtro falla, intentamos con el primer mensaje del historial
  const lastUserMessage = userMessages.length > 0 
    ? toMessageText(userMessages[userMessages.length - 1].content)
    : toMessageText(messages[0].content);
  
  if (!lastUserMessage) {
     return { messages: [{ role: "ai", content: "Lo siento, no pude identificar qué producto buscas. ¿Podrías repetirlo?" }] };
  }

  // Obtenemos todos los productos del backend
  const allProducts = await getProducts();
  const productListStr = allProducts.products
    .map(p => `- ${p.name}: $${p.sellPriceClient}`)
    .join("\n");
  
  // Búsqueda de seguridad por código
  const quickMatch = allProducts.products.filter(p => 
    lastUserMessage.toLowerCase().includes(p.name.toLowerCase()) || 
    p.name.toLowerCase().includes(lastUserMessage.toLowerCase())
  );

  const systemInstruction = `
    Eres un asistente de ventas experto de vasvani app. Tu única tarea es dar el precio del producto o categoría solicitada.
    
    LISTA DE PRODUCTOS:
    ${productListStr}
    
    REGLA: Si el usuario menciona un producto o categoría (ej: whiskys) de la lista, dale los precios exactos. 
    Si hay varios similares, lístallos todos de forma prolija. 
    Responde de forma directa y amable.
  `;
  
  const contextMessage = quickMatch.length > 0 
    ? `USUARIO BUSCA: "${lastUserMessage}". \nCONTEXTO DB: ${quickMatch.map(p => p.name).join(", ")}.`
    : lastUserMessage;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    config: { systemInstruction, temperature: 0.1 },
    contents: contextMessage,
  });

  const responseText = response.text ?? "No encontré ese producto. ¿Querés la lista completa?";
  const lowerResponse = responseText.toLowerCase();
  const wantsFollowUp = lowerResponse.includes("lista completa") || lowerResponse.includes("ver la lista");

  return { 
    messages: [{ role: "ai", content: responseText }],
    activeIntent: wantsFollowUp ? "list_prices" : null 
  };
};

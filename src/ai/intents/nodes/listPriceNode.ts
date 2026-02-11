import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { listProducts, ProductListItem as Item } from "../../../../backend/src/services/products.js";
import { toCapitalized } from "../utils/format.js";

export const listPriceNode: GraphNode<typeof State> = async () => {
  const getAllPrices: Item[] = await listProducts();
  let responseMessage = "Lista de productos:\n";

  const typeOfProduct = [...new Set(getAllPrices.map((item) => item.type))];

  for (const type of typeOfProduct) {
    responseMessage += `\n-- ${toCapitalized(type)} --\n`;
    const productsOfType = getAllPrices.filter((item) => item.type === type);
    for (const product of productsOfType) {
      responseMessage += `${product.name}, precio: $ ${product.sellPriceClient}\n`;
    }
  }
  return { messages: [{ role: "ai", content: responseMessage }] };
};

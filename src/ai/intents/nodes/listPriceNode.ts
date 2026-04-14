import { GraphNode } from "@langchain/langgraph";
import { State } from "../../state/schema.js";
import { toCapitalized } from "../utils/format.js";
import { Product, ProductsResponse } from "../../../api/product.schema.js";
import getProducts from "../../../api/get-products.js";


export const listPriceNode: GraphNode<typeof State> = async () => {
  const getAllPrices: ProductsResponse = await getProducts();
  let responseMessage = "Lista de productos:\n";
  const listOfProducts = getAllPrices.products;
  const typeOfProduct = [...new Set(listOfProducts.map((item: Product) => item.type))];

  for (const type of typeOfProduct) {
    responseMessage += `\n-- ${toCapitalized(type as string)} --\n`;
    const productsOfType = listOfProducts.filter((item: Product) => item.type === type);
    for (const product of productsOfType) {
      responseMessage += `${product.name}, precio: $ ${product.sellPriceClient}\n`;
    }
  }
  return { messages: [{ role: "ai", content: responseMessage }] };
};

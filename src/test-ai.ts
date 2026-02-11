import "dotenv/config";
import { runAiIntent } from "./services/ai.js";

async function debugGraph() {
  console.log("--- Starting AI Graph Test ---");

  // Mock data to simulate a WhatsApp message
  const testMessage = "quiero registrarme";
  const testSender = "user123";
  const testPhone = "123456789";

  try {
    console.log(`Input: "${testMessage}"`);

    // Invoke your LangGraph function
    const response = await runAiIntent(testMessage, testSender, testPhone);

    console.log("------------------------------");
    console.log("AI Response:", response);
    console.log("------------------------------");
  } catch (error) {
    console.error("Error during graph execution:", error);
  }
}

debugGraph();

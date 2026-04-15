import { describe, it, expect, afterAll } from 'vitest';
import "dotenv/config";
import { registerClientNode } from '../ai/intents/nodes/registerClientNode.js';
import getClientByPhoneId from '../api/client/get-client-by-phone-id.js';
import deleteClient from '../api/client/delete-client.js';
import { env } from '../config/env.js';

describe('registerClientNode Integration Test', () => {
  // Generar un número de teléfono único para evitar conflictos si se corre el test varias veces
  const testPhone = `569${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testSender = `test_user_${Date.now()}`;

  it('should register a new client through the AI node', async () => {
    // Simulamos el estado inicial que recibiría el nodo después de que el usuario envíe sus datos
    const state = {
      messages: [
        {
          role: "user", // En LangGraph suele ser 'user' o 'human'
          content: "Hola, me quiero registrar. Me llamo Carlos Test, mi local es 'Test Shop' y la dirección es Falsa 123",
          additional_kwargs: {
            sender: testSender,
            phone: testPhone
          }
        }
      ],
      activeIntent: "register_client"
    };

    console.log(`Running test with phone: ${testPhone}`);

    // Ejecutamos el nodo
    // @ts-ignore - El tipo de State en LangGraph es complejo, simplificamos para el test
    const result = await registerClientNode(state);

    // Verificamos que la respuesta de la IA sea positiva
    expect(result.messages[0].content).toContain("Cliente registrado");
    
    // Verificamos que el intent activo se haya limpiado
    expect(result.activeIntent).toBeNull();

    // Verificamos en el backend que el cliente realmente exista
    const clientFound = await getClientByPhoneId(testSender);
    expect(clientFound).not.toBeNull();
    expect(clientFound?.localName).toBe("Test Shop");
    expect(clientFound?.phone).toBe(testPhone);
  }, 30000);

  afterAll(async () => {
    // Cleanup: Buscamos y borramos el cliente de prueba
    const client = await getClientByPhoneId(testSender);
    if (client) {
      const deleted = await deleteClient(client.id);
      if (deleted) {
        console.log(`✅ Cleanup: Deleted test client with ID ${client.id}`);
      } else {
        console.warn(`⚠️ Cleanup: Failed to delete test client with ID ${client.id}`);
      }
    }
  });
});

// Helper para limpiar el formato del teléfono si fuera necesario
function phoneNumberToId(phone: string) {
    return phone.replace(/\+/g, "");
}

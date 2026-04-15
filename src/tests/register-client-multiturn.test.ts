import { describe, it, expect, afterAll } from 'vitest';
import "dotenv/config";
import { registerClientNode } from '../ai/intents/nodes/registerClientNode.js';
import getClientByPhoneId from '../api/client/get-client-by-phone-id.js';
import deleteClient from '../api/client/delete-client.js';

describe('registerClientNode Multi-turn Integration Test', () => {
  const testPhone = `569${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testSender = `multi_test_${Date.now()}`;

  // Usamos una variable para ir acumulando el estado entre turnos
  const state: any = {
    messages: [],
    activeIntent: null
  };

  it('Step 1: Should ask for missing fields when user only says they want to register', async () => {
    state.messages.push({
      role: "user",
      content: "Hola, quiero registrarme.",
      additional_kwargs: {
        sender: testSender,
        phone: testPhone
      }
    });

    // @ts-ignore
    const result = await registerClientNode(state);

    // Verificamos que pida los datos
    expect(result.messages[0].content).toContain("datos");
    expect(result.messages[0].content).toContain("nombre");
    // Verificamos que mantenga el intent activo
    expect(result.activeIntent).toBe("register_client");

    // Actualizamos el estado con la respuesta de la IA para que esté disponible en el siguiente turno
    state.messages.push(result.messages[0]);
    state.activeIntent = result.activeIntent;
  }, 30000);

  it('Step 2: Should register the client when the missing fields are provided', async () => {
    // El usuario responde con los datos faltantes
    state.messages.push({
      role: "user",
      content: "Carlos Multi, Multi Shop, Falsa 123",
      additional_kwargs: {
        sender: testSender,
        phone: testPhone
      }
    });

    // @ts-ignore
    const result = await registerClientNode(state);

    // Verificamos que confirme el registro
    expect(result.messages[0].content).toContain("Cliente registrado");
    expect(result.messages[0].content).toContain("Multi Shop");
    // Verificamos que limpie el intent
    expect(result.activeIntent).toBeNull();

    // Verificamos en el backend que realmente se haya creado
    const clientFound = await getClientByPhoneId(testSender);
    expect(clientFound).not.toBeNull();
    expect(clientFound?.localName).toBe("Multi Shop");
    expect(clientFound?.phone).toBe(testPhone);
  }, 30000);

  afterAll(async () => {
    // Cleanup de seguridad
    const client = await getClientByPhoneId(testSender);
    if (client) {
      await deleteClient(client.id);
      console.log(`✅ Multi-turn Cleanup: Deleted test client with ID ${client.id}`);
    }
  });
});

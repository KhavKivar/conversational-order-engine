import makeWASocket, {
  Browsers,
  useMultiFileAuthState,
  UserFacingSocketConfig,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from "baileys";
import "dotenv/config";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";

import { env } from "./config/env.js";
import { runAiIntent } from "./services/ai.js";

export async function startWhatsApp(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  // Obtener la última versión de WhatsApp Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Usando WhatsApp v${version.join(".")}, última versión: ${isLatest}`);

  const config_custom: UserFacingSocketConfig = {
    version,
    browser: Browsers.ubuntu("Chrome"), // Cambiamos a Ubuntu para pasar más desapercibidos
    auth: state,
    printQRInTerminal: false,
    connectTimeoutMs: 60_000,
    defaultQueryTimeoutMs: 60_000,
    keepAliveIntervalMs: 30_000,
    retryRequestDelayMs: 5000,
  };

  const sock = makeWASocket(config_custom);

  // Guardar credenciales cada vez que se actualizan
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Escaneá este código QR (O esperá el código de vinculación):");
      qrcode.generate(qr, { small: true });
    }

    // ✅ Solicitar pairing code solo cuando estemos realmente conectando y no estemos registrados
    if (connection === "connecting" && !sock.authState.creds.registered) {
      const phoneNumber = env.BOT_NUMBER.replace(/\D/g, "");
      if (phoneNumber) {
        try {
          // Un mini delay para que el socket esté listo
          await new Promise(resolve => setTimeout(resolve, 2000));
          const code = await sock.requestPairingCode(phoneNumber);
          console.log(`\n🚀 TU CÓDIGO DE VINCULACIÓN: ${code}\n`);
          console.log(`Ingresá este código en WhatsApp (Dispositivos vinculados > Vincular con número de teléfono)`);
        } catch (error) {
          console.error("Error al solicitar el Pairing Code:", error);
        }
      }
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Conexión cerrada (code ${statusCode}). Reintentando: ${shouldReconnect}`);
      
      if (shouldReconnect) {
        setTimeout(() => startWhatsApp(), 5000); // 5 segundos de espera antes de reintentar
      }
    } else if (connection === "open") {
      console.log("✅ ¡Conexión establecida con éxito!");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const remoteJid = msg.key.remoteJid;
    if (!remoteJid || remoteJid.endsWith("@g.us")) return;
    
    const text = msg.message.conversation ?? msg.message.extendedTextMessage?.text ?? "";
    if (!text.trim()) return;

    console.log(`Nuevo mensaje de ${remoteJid}: ${text}`);

    try {
      // Mostrar que el bot está escribiendo para mejorar la UX
      await sock.sendPresenceUpdate("composing", remoteJid);
      
      // Llamar a la lógica de IA
      // El teléfono lo extraemos del JID (ej: 5491112345678@s.whatsapp.net -> 5491112345678)
      const phoneNumber = remoteJid.split("@")[0];
      const iaResponse = await runAiIntent(text, remoteJid, phoneNumber);
      
      await sock.sendPresenceUpdate("paused", remoteJid);

      // Responder al usuario
      await sock.sendMessage(remoteJid, { text: iaResponse });
    } catch (error) {
      console.error("Error procesando mensaje con IA:", error);
    }
  });
}

import makeWASocket, {
  Browsers,
  useMultiFileAuthState,
  UserFacingSocketConfig,
} from "baileys";
import "dotenv/config";
import qrcode from "qrcode-terminal";

export async function startWhatsApp(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  const config_custom: UserFacingSocketConfig = {
    browser: Browsers.windows("Google Chrome"),
    auth: state,
  };

  const sock = makeWASocket(config_custom);

  sock.ev.on("creds.update", saveCreds);

  const targetJid = process.env.TARGET_JID || "";
  const helloMessage = process.env.MESSAGE || "Hello from OrderSapp!";
  let sentOnce = false;

  sock.ev.on("connection.update", ({ connection, qr }) => {
    if (qr) {
      console.log("Scan this QR with WhatsApp:");
      qrcode.generate(qr, { small: true });
    }
    if (connection) {
      console.log(`connection: ${connection}`);
    }
    if (connection === "open" && !sentOnce) {
      sentOnce = true;
      // void sock.sendMessage(targetJid, { text: helloMessage });
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const remoteJid = msg.key.remoteJid;

    const remoteJidAlt = msg.key.remoteJidAlt;
    const phoneNumber = remoteJidAlt?.split("@")[0];
    if (!remoteJid || remoteJid.endsWith("@g.us")) return;
    console.log("msg", msg);
    const text =
      msg.message.conversation ?? msg.message.extendedTextMessage?.text ?? "";

    // if (!text.trim()) return;

    // console.log("phoneNumber:", phoneNumber);

    // console.log(`New message from ${remoteJid}:`, text);
    // await sock.sendPresenceUpdate("composing", remoteJid);
    // const iaResponse = await runAiIntent(text, remoteJid, phoneNumber);
    // await sock.sendPresenceUpdate("paused", remoteJid);

    // await sock.sendMessage(remoteJid, { text: iaResponse });
  });
}

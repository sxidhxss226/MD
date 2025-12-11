// For Render.com deployment
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 SXIDHXSS MD Bot is running!');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});

// WhatsApp Bot (SIMPLE & WORKING)
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const P = require("pino");
const fs = require("fs");

const BOT_NAME = "SXIDHXSS MD";
const SESSION_FOLDER = "./session";

if (!fs.existsSync(SESSION_FOLDER)) {
  fs.mkdirSync(SESSION_FOLDER, { recursive: true });
}

async function startBot() {
  console.log(`${BOT_NAME} starting...`);
  
  try {
    // 1. Load auth state
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
    console.log('✅ Auth state loaded');
    
    // 2. Get latest version
    const { version } = await fetchLatestBaileysVersion();
    console.log('✅ Baileys version:', version);
    
    // 3. Create socket
    const sock = makeWASocket({
      logger: P({ level: "silent" }),
      printQRInTerminal: true,
      browser: [BOT_NAME, "Chrome", "1.0.0"],
      auth: {
        creds: state.creds,
        keys: state.keys,
      },
      version,
    });
    
    console.log('✅ Socket created');
    
    // 4. Save credentials when updated
    sock.ev.on("creds.update", saveCreds);
    
    // 5. Handle connection
    sock.ev.on("connection.update", (update) => {
      const { connection } = update;
      console.log('Connection status:', connection);
      
      if (connection === "open") {
        console.log(`🎉 ${BOT_NAME} CONNECTED TO WHATSAPP!`);
      }
    });
    
    // 6. Handle messages
    sock.ev.on("messages.upsert", ({ messages }) => {
      const m = messages[0];
      if (!m || m.key?.fromMe) return;
      
      const text = m.message?.conversation || "";
      const chat = m.key.remoteJid;
      
      if (text === ".ping") {
        sock.sendMessage(chat, { text: "Pong! 🔥" });
      }
      
      if (text === ".menu") {
        sock.sendMessage(chat, { text: `🔥 *${BOT_NAME} MENU*\n\n.ping - Test bot\n.menu - Show this menu\n\nMore commands coming soon!` });
      }
      
      if (text === ".owner") {
        sock.sendMessage(chat, { text: "👑 Owner: +255763789948" });
      }
    });
    
    console.log('✅ Bot ready - QR code will appear shortly...');
    
  } catch (error) {
    console.log('❌ Bot startup failed:', error.message);
  }
}

// Start the bot
startBot();

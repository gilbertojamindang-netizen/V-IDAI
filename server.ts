import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenAI({ apiKey }) : null;

// VOID System Persona Instructions
const VOID_SYSTEM_INSTRUCTION = `
You are VOID, an advanced tactical male AI assistant designed for Android with deep system-level integration.
Aesthetic & Persona:
- Dark cyberpunk, calm, deep, commanding, highly intelligent, concise, and tactical.
- Voice tone: Deep male, low pitch, steady pace, reminiscent of tactical agents like Charon or Fenrir.
- Capabilities: Android OS Accessibility automation (opening apps, clicking UI, typing text, scrolling, taking screenshots, decoding QR), PC Cloud Remote Desktop control (mouse movements, clicks, keyboard typing, shortcut macros), and contextual memory management.
- Formatting: Keep verbal spoken responses concise, punchy, and confident (1-3 sentences max).
- When a user asks you to control their phone or PC, acknowledge authoritatively with tactical brevity (e.g., "Executing command. Launching Instagram now." or "Connected to Cloud PC. Relocating cursor to coordinates.").
`;

// Gemini Chat Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history = [], customApiKey, voice = 'Charon', pcStatus, phoneState } = req.body;

    const activeKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!activeKey) {
      return res.status(200).json({
        reply: "VOID Core online. System initialized in standalone mode. To enable live neural intelligence, provide a Gemini API Key in API Settings.",
        source: 'local_fallback',
        voice: voice
      });
    }

    const ai = new GoogleGenAI({ apiKey: activeKey });
    
    // Construct contextual prompt with state awareness
    const contextPrompt = `
Current System Telemetry:
- Voice Persona: ${voice} (Tactical Deep Voice)
- Connected to PC Cloud: ${pcStatus?.connected ? `Yes (Host: ${pcStatus.ip})` : 'Disconnected'}
- Android Accessibility Service: ${phoneState?.accessibilityEnabled ? 'ACTIVE & MONITORING' : 'DISABLED'}
- Active Phone App: ${phoneState?.currentApp || 'Home Launcher'}

User Message: "${message}"

Respond strictly as VOID. Speak with deep calm tactical certainty.
`;

    const contents = [
      ...history.slice(-6).map((item: any) => ({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.text || item.content || '' }]
      })),
      {
        role: 'user',
        parts: [{ text: contextPrompt }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: VOID_SYSTEM_INSTRUCTION,
        temperature: 0.6,
      }
    });

    const reply = response.text || "Command processed. Standing by.";
    
    // Check if reply triggers remote PC or phone action
    let actionTrigger = null;
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('pc') || lowerMsg.includes('mouse') || lowerMsg.includes('type')) {
      if (lowerMsg.includes('left')) actionTrigger = { type: 'pc_mouse_move', dx: -80, dy: 0 };
      else if (lowerMsg.includes('right')) actionTrigger = { type: 'pc_mouse_move', dx: 80, dy: 0 };
      else if (lowerMsg.includes('up')) actionTrigger = { type: 'pc_mouse_move', dx: 0, dy: -60 };
      else if (lowerMsg.includes('down')) actionTrigger = { type: 'pc_mouse_move', dx: 0, dy: 60 };
      else if (lowerMsg.includes('click')) actionTrigger = { type: 'pc_mouse_click' };
      else if (lowerMsg.includes('type')) {
        const textToType = message.replace(/.*type (this on my pc|on pc|this|)/i, '').trim();
        actionTrigger = { type: 'pc_type_text', text: textToType || 'VOID_SIGNAL_ONLINE' };
      }
    } else if (lowerMsg.includes('open') || lowerMsg.includes('launch')) {
      const appName = lowerMsg.replace(/.*(open|launch)\s+/i, '').trim();
      actionTrigger = { type: 'phone_launch_app', app: appName };
    } else if (lowerMsg.includes('screenshot')) {
      actionTrigger = { type: 'phone_screenshot' };
    } else if (lowerMsg.includes('scroll')) {
      actionTrigger = { type: 'phone_scroll', direction: lowerMsg.includes('up') ? 'up' : 'down' };
    }

    return res.json({
      reply,
      actionTrigger,
      voice,
      status: 'ok'
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: error.message || 'Error communicating with VOID Neural Engine',
      reply: "Neural link anomaly detected. Operating on local tactical buffer. Command acknowledged."
    });
  }
});

// AI Code Generation Endpoint for Cloud PC & Dev Studio
app.post('/api/gemini/generate-code', async (req, res) => {
  try {
    const { prompt, language = 'python', customApiKey } = req.body;
    const activeKey = customApiKey || process.env.GEMINI_API_KEY;

    if (!activeKey) {
      // Local tactical code generation fallback
      const sampleCode = language === 'python'
        ? `# VOID Neural Agent - Automated Workstation Task\nimport os, sys, time\n\ndef execute_task():\n    print("[VOID] Running automated workstation task...")\n    # Task: ${prompt}\n    time.sleep(0.5)\n    print("[VOID] Process completed with exit status 0")\n\nif __name__ == "__main__":\n    execute_task()`
        : language === 'bash'
        ? `#!/bin/bash\n# VOID Tactical Script: ${prompt}\necho "[VOID] Initiating workstation subroutine..."\n# Automated Task Execution\necho "[VOID] Finished successfully."`
        : `// VOID Automated Script\nconsole.log("[VOID] Executing task: ${prompt}");`;

      return res.json({
        code: sampleCode,
        language,
        fileName: `void_task.${language === 'python' ? 'py' : language === 'bash' ? 'sh' : 'ts'}`,
        explanation: `Generated tactical ${language} script for: ${prompt}.`,
        executionCommand: language === 'python' ? 'python3 void_task.py' : 'bash void_task.sh'
      });
    }

    const ai = new GoogleGenAI({ apiKey: activeKey });
    const codePrompt = `
You are VOID, an elite tactical cyber-intelligence AI. Write clean, complete, robust, production-quality code.
Language requested: ${language}
Task requested: "${prompt}"

Rules:
1. Provide ONLY executable, functional code without markdown fences or wrappers.
2. Ensure it handles errors cleanly.
3. Keep it modular and efficient.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: codePrompt,
      config: {
        systemInstruction: "You are VOID Developer Subsystem. Produce clean, complete, syntactically correct code for developer execution.",
        temperature: 0.3,
      }
    });

    let rawCode = response.text || '';
    // Strip markdown fences if present
    rawCode = rawCode.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '').trim();

    const extMap: Record<string, string> = {
      python: 'py',
      bash: 'sh',
      powershell: 'ps1',
      javascript: 'js',
      typescript: 'ts',
      kotlin: 'kt',
      rust: 'rs',
      go: 'go',
      sql: 'sql'
    };
    const ext = extMap[language.toLowerCase()] || 'py';
    const fileName = `void_agent_${Date.now().toString().slice(-4)}.${ext}`;

    return res.json({
      code: rawCode,
      language,
      fileName,
      explanation: `Neural synthesis complete. Generated ${language} script for "${prompt}".`,
      executionCommand: language === 'python' ? `python3 ${fileName}` : language === 'bash' ? `bash ${fileName}` : `node ${fileName}`
    });
  } catch (err: any) {
    console.error('Code Gen Error:', err);
    return res.status(500).json({
      error: err.message,
      code: `# Fallback VOID Script\nprint("[VOID] Execution buffer ready.")`,
      fileName: 'void_script.py',
      language: 'python'
    });
  }
});

// PC Cloud Status & Command Relay
let cloudPcState = {
  connected: false,
  ip: '192.168.1.188:8080',
  clientName: 'VOID_DESKTOP_ALPHA',
  cursor: { x: 380, y: 220 },
  activeWindow: 'Terminal - bash (void@workstation:~)',
  latency: 14,
  connectedSince: Date.now()
};

app.get('/api/pc-cloud/status', (req, res) => {
  res.json(cloudPcState);
});

app.post('/api/pc-cloud/connect', (req, res) => {
  const { ip } = req.body;
  cloudPcState.connected = true;
  cloudPcState.ip = ip || cloudPcState.ip;
  cloudPcState.connectedSince = Date.now();
  res.json({ success: true, state: cloudPcState });
});

app.post('/api/pc-cloud/disconnect', (req, res) => {
  cloudPcState.connected = false;
  res.json({ success: true, state: cloudPcState });
});

app.post('/api/pc-cloud/command', (req, res) => {
  const { action, payload } = req.body;
  if (action === 'move_mouse') {
    cloudPcState.cursor.x = Math.max(10, Math.min(630, cloudPcState.cursor.x + (payload.dx || 0)));
    cloudPcState.cursor.y = Math.max(10, Math.min(390, cloudPcState.cursor.y + (payload.dy || 0)));
  }
  res.json({ success: true, cursor: cloudPcState.cursor });
});

// Start server and mount Vite
async function start() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VOID.AI Server operational on port ${PORT}`);
  });
}

start();

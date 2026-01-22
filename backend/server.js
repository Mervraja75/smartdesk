import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//==================================
// PERFORMANCE HELPERS
//==================================

// Trim history to reduce latency + cost
function trimHistory(history = [], maxMessages = 4) {
  const sliced = Array.isArray(history) ? history.slice(-maxMessages) : [];
  return sliced.map((m) => ({
    role: m.sender === "user" ? "user" : "assistant",
    content: String(m.text || ""),
  }));
}

// Simple in-memory cache (Render will reset it on restart — OK for Phase 1)
const CACHE_MAX = 300;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const replyCache = new Map(); // key -> { reply, expiresAt }

function makeCacheKey(message) {
  // cache by normalized message (simple + effective)
  return String(message || "").trim().toLowerCase();
}

function getFromCache(key) {
  const hit = replyCache.get(key);
  if (!hit) return null;

  if (Date.now() > hit.expiresAt) {
    replyCache.delete(key);
    return null;
  }
  return hit.reply;
}

function setCache(key, reply) {
  if (!key || !reply) return;

  replyCache.set(key, {
    reply,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  // Evict oldest if over max size
  if (replyCache.size > CACHE_MAX) {
    const oldestKey = replyCache.keys().next().value;
    replyCache.delete(oldestKey);
  }
}

// Optional: light cleanup sometimes
function cleanupCache() {
  const now = Date.now();
  for (const [key, val] of replyCache.entries()) {
    if (now > val.expiresAt) replyCache.delete(key);
  }
}

//==================================
// ROUTES
//==================================
app.get("/", (req, res) => {
  res.json({ ok: true, service: "SmartDesk AI backend" });
});

app.post("/chat", async (req, res) => {
  const started = Date.now();

  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    // Cleanup cache occasionally (cheap)
    if (Math.random() < 0.05) cleanupCache();

    // ✅ 1) Cache check (FAST)
    const cacheKey = makeCacheKey(message);
    const cachedReply = getFromCache(cacheKey);
    if (cachedReply) {
      return res.json({
        reply: cachedReply,
        cached: true,
        ms: Date.now() - started,
      });
    }

    // ✅ 2) Trim history (faster + cheaper)
    const trimmedHistory = trimHistory(history, 4);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are SmartDesk, a helpful IT support assistant. " +
            "Give clear step-by-step troubleshooting. " +
            "Ask 1-2 clarifying questions when needed. " +
            "Keep replies concise.",
        },
        ...trimmedHistory,
        { role: "user", content: message },
      ],
      temperature: 0.4,
      max_tokens: 250, // ✅ keeps replies short = faster
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't respond.";

    // ✅ Save to cache
    setCache(cacheKey, reply);

    res.json({
      reply,
      cached: false,
      ms: Date.now() - started,
    });
  } catch (err) {
    console.error("AI error:", err?.message || err);
    res.status(500).json({ error: "AI request failed" });
  }
});

// ✅ Render-friendly: bind to 0.0.0.0 and use PORT from environment
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SmartDesk backend running on port ${PORT}`);
});
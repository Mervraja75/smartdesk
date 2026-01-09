import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (req, res) => {
  res.json({ ok: true, service: "SmartDesk AI backend" });
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    // Keep history short (cost + speed)
    const trimmedHistory = history.slice(-8).map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

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
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I couldn't respond.";

    res.json({ reply });
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
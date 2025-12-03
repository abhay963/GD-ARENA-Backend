import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Utility: Safe JSON parsing (Groq sometimes adds extra text)
function safeJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    return JSON.parse(text.slice(start, end + 1));
  }
}

// Random fallback topics (not used anymore)
const topics = [
  "Is AI a threat or an opportunity?",
  "Impact of social media on youth",
  "Should remote work continue?",
  "Is India ready for electric vehicles?",
  "Will robots replace humans in jobs?",
  "Does technology make people isolated?",
];


// 1️⃣ API: Start GD → Generate topic + 2 AI opening responses
app.get("/api/start-gd", async (req, res) => {
  try {
    const topicPrompt = `
Generate 10 latest trending and unique Group Discussion topics
based on:
- technology
- global issues
- India current affairs
- business
- ethics
- society
- AI
Technology
Global Issues
India Current Affairs
Business & Economy
Ethics & Morality
Society & Culture
Artificial Intelligence & Future Tech
Abstract Thinking & Creative Themes
Sustainability & Environment
Geopolitics & International Relations

STRICT JSON OUTPUT:
{
  "topics": ["topic1", "topic2", ...]
}
`;

    // Step 1: Generate trending topics
    const topicResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: topicPrompt }],
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
    );

    const trendingTopics = safeJSON(
      topicResponse.data.choices[0].message.content
    ).topics;

    const topic =
      trendingTopics[Math.floor(Math.random() * trendingTopics.length)];

    // Step 2: Agents opening statements
    const prompt = `
You are simulating a group discussion with TWO AI participants.

STRICT JSON OUTPUT ONLY:
{
  "Player 1": "text...",
  "Player 2": "text..."
}

RULES:
- Respond as if it's the opening of a GD.
- Keep responses short (2–3 lines).
- No greetings like "Hello".
- Start directly with your viewpoint.
- Player 1: aggressive debater
- Player 2: calm logical analyst

Topic: ${topic}
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
    );

    return res.json({
      topic,
      agents: safeJSON(response.data.choices[0].message.content),
    });
  } catch (err) {
    console.log("AI ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Startup AI error" });
  }
});



// 2️⃣ API: Continue GD after user speaks (turn-by-turn)
app.post("/api/gd", async (req, res) => {
  try {
    const { userSpeech, topic, history } = req.body;

    // Convert history → text transcript
    const transcript = history
      .map((m) => `${m.speaker.replace("Agent", "Player")}: ${m.text}`)
      .join("\n");

    const prompt = `
You are simulating a real GD with 2 AI participants.

STRICT JSON OUTPUT ONLY:
{
  "Player 1": "text...",
  "Player 2": "text..."
}

Participants:
- Player 1 = aggressive debater
- Player 2 = logical analyst

Topic: ${topic}

DISCUSSION SO FAR:
${transcript}

User just said:
${userSpeech}

Continue the GD discussion.
Keep responses short (4–5 lines).
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
    );

    res.json(safeJSON(response.data.choices[0].message.content));
  } catch (err) {
    console.log("AI ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Turn error" });
  }
});



// Start Server
app.listen(5000, () => console.log("Backend running on 5000"));

import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Random topics
const topics = [
  "Is AI a threat or an opportunity?",
  "Impact of social media on youth",
  "Should remote work continue?",
  "Is India ready for electric vehicles?",
  "Will robots replace humans in jobs?",
  "Does technology make people isolated?"
];

// 1️⃣ API to get a random topic AND AI agents speak first
// 1️⃣ API to get a REAL-TIME TRENDING GD TOPIC + agent opening
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

    // Fetch trending topics dynamically
    const topicResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: topicPrompt }],
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` } }
    );

    // Parse trending topics
    const trendingTopics = JSON.parse(
      topicResponse.data.choices[0].message.content
    ).topics;

    // Pick a random topic from generated list
    const topic = trendingTopics[Math.floor(Math.random() * trendingTopics.length)];

    // Now run Agent Opening using the chosen topic
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
- Agent 1: aggressive debater
- Agent 2: calm logical analyst

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
      agents: JSON.parse(response.data.choices[0].message.content),
    });

  } catch (err) {
    console.log("AI ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Startup AI error" });
  }
});


// 2️⃣ API for turn-taking after user speaks
app.post("/api/gd", async (req, res) => {
  try {
    const { userSpeech, topic, history } = req.body;

    const transcript = history
      .map((m) => `${m.speaker}: ${m.text}`)
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

    res.json(JSON.parse(response.data.choices[0].message.content));

  } catch (err) {
    console.log("AI ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Turn error" });
  }
});

app.listen(5000, () => console.log("Backend running on 5000"));

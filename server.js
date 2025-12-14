import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import googleTrends from "google-trends-api";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* --------------------------------------------------
   Utility: Safe JSON parser
--------------------------------------------------- */
function safeJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    return JSON.parse(text.slice(start, end + 1));
  }
}

/* --------------------------------------------------
   GD CATEGORIES (PLACEMENT-GRADE)
--------------------------------------------------- */
const GD_CATEGORIES = [
  "Social Issues",
  "Current Affairs",
  "Business & Economy",
  "Technology",
  "Ethics & Morality",
  "Environment & Sustainability",
  "Abstract & Philosophical"
];

let categoryIndex = 0;

function getNextCategory() {
  const category = GD_CATEGORIES[categoryIndex];
  categoryIndex = (categoryIndex + 1) % GD_CATEGORIES.length;
  return category;
}

/* --------------------------------------------------
   STEP 1: Fetch Google Trends (India)
--------------------------------------------------- */
async function getTrendingTopics() {
  try {
    const res = await googleTrends.dailyTrends({ geo: "IN" });
    const data = JSON.parse(res);

    return data.default.trendingSearchesDays[0].trendingSearches
      .slice(0, 10)
      .map(t => t.title.query);
  } catch (err) {
    console.error("Google Trends failed:", err.message);

    // HARD FALLBACK (never crash)
    return [
      "India economic growth",
      "Youth unemployment",
      "Climate change policy",
      "Startup ecosystem",
      "Digital privacy"
    ];
  }
}

/* --------------------------------------------------
   STEP 2: Generate GD topic (CATEGORY ENFORCED)
--------------------------------------------------- */
async function generateGDTopic(trends) {
  const category = getNextCategory();

  const prompt = `
You are generating a GROUP DISCUSSION topic.

CATEGORY (STRICT): ${category}

Use ONE of the following REAL trending searches
ONLY as background context (do NOT mention them):

${trends.join("\n")}

Rules:
- Topic MUST belong to the given CATEGORY
- Suitable for campus placements
- Debatable (multiple viewpoints)
- No yes/no framing
- Avoid AI topics unless category is Technology
- Sound like a real GD panel question

STRICT JSON:
{
  "category": "${category}",
  "topic": "..."
}
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
    }
  );

  return safeJSON(response.data.choices[0].message.content);
}

/* --------------------------------------------------
   API 1️⃣: START GD
--------------------------------------------------- */
app.get("/api/start-gd", async (req, res) => {
  try {
    const trends = await getTrendingTopics();
    const { topic, category } = await generateGDTopic(trends);

    const openingPrompt = `
Simulate a Group Discussion opening with TWO AI participants.

STRICT JSON:
{
  "Player 1": "text",
  "Player 2": "text"
}

Rules:
- 2–3 lines each
- No greetings
- Player 1: aggressive debater
- Player 2: calm logical analyst

Topic: ${topic}
`;

    const openingRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: openingPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    res.json({
      category,
      topic,
      agents: safeJSON(openingRes.data.choices[0].message.content),
    });

  } catch (error) {
    console.error("START GD ERROR:", error.message);
    res.status(500).json({ error: "Failed to start GD" });
  }
});

/* --------------------------------------------------
   API 2️⃣: CONTINUE GD
--------------------------------------------------- */
app.post("/api/gd", async (req, res) => {
  try {
    const { userSpeech, topic, history } = req.body;

    const transcript = history
      .map(h => `${h.speaker}: ${h.text}`)
      .join("\n");

    const prompt = `
Continue the Group Discussion with TWO AI participants.

STRICT JSON:
{
  "Player 1": "text",
  "Player 2": "text"
}

Topic: ${topic}

Discussion so far:
${transcript}

User just said:
${userSpeech}

Rules:
- 4–5 lines max
- Realistic GD tone
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    res.json(safeJSON(response.data.choices[0].message.content));

  } catch (error) {
    console.error("GD TURN ERROR:", error.message);
    res.status(500).json({ error: "GD turn failed" });
  }
});

/* --------------------------------------------------
   START SERVER
--------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GD Backend running on port ${PORT}`);
});

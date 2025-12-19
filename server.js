import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { updateUserStreak, getUserStreak } from "./streakService.js";

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
   FIXED GD TOPICS (CLASSIC PLACEMENT QUESTIONS)
--------------------------------------------------- */
const GD_TOPICS = [
   "Will AI replace engineers?",
  "5G technology and its impact on smart cities",
  "Quantum computing: Threat or opportunity?",
  "Is blockchain technology beyond cryptocurrency?",
  "The rise of electric vehicles: Can India become a global EV hub?",
  "Space tourism: The future of engineering innovation?",
  "Metaverse: Real opportunity or just a buzzword?",
  "Internet of Things (IoT): Boon or threat to personal privacy?",
  "Cybersecurity: Are engineers doing enough?",
  "Robotics in manufacturing: Job killer or job creator?",

  /* -------- Environment & Sustainability -------- */
  "Green engineering: The need of the hour",
  "Can India achieve net-zero emissions by 2070?",
  "Is nuclear energy safe and sustainable?",
  "Engineering solutions for climate change",
  "Smart infrastructure vs natural preservation",

  /* -------- Career & Education -------- */
  "Should coding be mandatory for all engineering streams?",
  "Are Indian engineering students industry-ready?",
  "Internships vs research: What is more valuable?",
  "Tier-1 vs Tier-3 college students: Who has better placement opportunities?",
  "Startup culture among engineering students: Encouraged or overhyped?",

  /* -------- Ethics & Society -------- */
  "Ethics in artificial intelligence: Who is accountable?",
  "Is social media damaging technical creativity?",
  "Should engineers have mandatory social service internships?",
  "Technology vs ethics: Where should we draw the line?",
  "Engineering brain drain: Is it still a problem in India?",

  /* -------- Current Affairs -------- */
  "Impact of AI tools like ChatGPT on engineering education",
  "India’s Moon and Mars missions: National pride or misplaced priorities?",
  "UPI going global: Can Indian fintech lead the world?",
  "Global tech layoffs: Lessons for Indian engineers",
  "Rise of deepfake technology: Should it be banned?",
  "Are beauty contests degrading womanhood?",
  "Our culture is decaying",
  "Educational qualification for politics",
  "Is our political system responsible for backwardness?",
  "Is T20 cricket killing real cricket skills?",
  "Will India become a superpower?",
  "High oil prices and ways to deal with them",
  "Skilled manpower shortage in India",
  "Wisdom finds truth",
  "Values are not what humanity is, but what humanity ought to be",
  "What is best for an individual is not necessarily best for society",
  "Courage to accept and dedication to improve are keys to success",
  "South Asian societies are shaped more by culture than the state",
  "Neglect of primary healthcare and education is the reason for India’s backwardness",
  "Biased media is a real threat to Indian democracy",
  "Rise of Artificial Intelligence: Jobless future or better opportunities?",
  "Chinese goods vs Indian goods",
  "Should attendance be compulsory in engineering colleges?",
  "Television: An idiot box or a useful resource?",
  "You should do what you love doing",
  "Breakups are startups",
  "Beauty or brain: Who can rule the world?",
  "Should we change our national game?",
  "Every cloud has a silver lining",
  "Indian villages: Strength or weakness?",
  "Should India announce a sports holiday?",
  "Water is the next oil",
  "English must remain the official language of India",
  "A borderless world is practically impossible",
  "Corruption is a necessary evil",
  "The dark side of junk food is still unknown",
  "UN plays an important role in global peacekeeping",
  "China is lagging behind India in software",
  "The quota system should be completely removed",
  "There is a serious lack of work-life balance today",
  "The age of wireless technology has arrived",
  "We have lost the importance of fruits in our diet",
  "Overdependence on diet products is ruining our health",
  "WhatsApp is more harmful than useful",
  "Social media is responsible for religious conflicts in India",
  "Unionization in the private sector is essential",
  "Offices should adopt a four-day work week",
  "India should not invest in space programs",
  "Beti Padhao will enable Beti Bachao",
  "Each One Teach One should be made compulsory",
  "India is losing its position as a dominant SAARC country",
  "Women should be given the choice of motherhood, not family pressure",
  "Marriage expenditure should be regulated",
  "Government jobs are the new dowry",
  "Impact of social media on human behavior",
  "Netflix is killing Indian cinema",
  "Role of social media in brand awareness",
  "Women empowerment",
  "Should prostitution be legalized in India?",
  "Indian market vs Chinese market",
  "Poverty in India: Causes, effects, and solutions",
  "Cashless economy: Is society ready for transformation?",
  "Impact of technology on jobs",
  "Merger of public sector banks: How beneficial is it?",
  "Water transport tourism as a boost to economic development",
  "Budget cycle change: Reform or convenience?",
  "Bank recapitalization vs NPA reduction",
  "GST: Will the economy grow faster with reduced tax rates?",
  "Farmers' income: Can India double it?",
  "Privatization of the Indian economy",
  "High deficit financing vs high interest rates",
  "Merging general and railway budgets",
  "Corruption in the economy and economic slowdown",
  "Make in India: Can it make India a manufacturing hub?",
  "US trade policy and global trade wars",
  "Media freedom: Should there be limits?",
  "Fake news threatens India’s social fabric",
  "Linking Aadhaar: Is making it mandatory a good idea?",
  "Banking scams in India",
  "Is India ready for a cashless economy?",
  "Death penalty for crimes against women",
  "Plastic ban: Economy vs environment",
  "Innovation vs invention",
  "Change is the only constant",
  "Freedom is a myth",
  "Fact vs opinion",
  "Leader or follower",
  "Means vs ends",
  "Effective manager vs ethical manager",
  "Women empowerment: Myth or reality?",
  "Impossible or I am possible?",
  "Issues over Article 370",
  "Living relationships: Should they be banned?",
  "Global warming",
  "Instagram: Pros and cons",
  "Is India ready for space exploration?",
  "Leaders are born or made?",
  "Placement scenario in India"
];



/* --------------------------------------------------
   CATEGORY MAPPING (AUTO-DETECTED)
--------------------------------------------------- */
function detectCategory(topic) {
  if (
    topic.includes("Social") ||
    topic.includes("Tobacco") ||
    topic.includes("Triple Talaq") ||
    topic.includes("languages") ||
    topic.includes("Education")
  ) return "Social Issues";

  if (
    topic.includes("GST") ||
    topic.includes("Economy") ||
    topic.includes("Black Money") ||
    topic.includes("Demonetisation") ||
    topic.includes("Cashless")
  ) return "Business & Economy";

  if (
    topic.includes("Technology") ||
    topic.includes("Crypto") ||
    topic.includes("Electric Vehicles") ||
    topic.includes("Aadhaar") ||
    topic.includes("Digital")
  ) return "Technology";

  if (
    topic.includes("Climate") ||
    topic.includes("Environment")
  ) return "Environment & Sustainability";

  if (
    topic.includes("Creativity") ||
    topic.includes("Efficiency")
  ) return "Abstract & Philosophical";

  return "Current Affairs";
}

/* --------------------------------------------------
   RANDOM TOPIC PICKER
--------------------------------------------------- */
function getRandomTopic() {
  const index = Math.floor(Math.random() * GD_TOPICS.length);
  const topic = GD_TOPICS[index];
  const category = detectCategory(topic);
  return { topic, category };
}

/* --------------------------------------------------
   API 1️⃣: START GD
--------------------------------------------------- */
app.get("/api/start-gd", async (req, res) => {
  try {
    const { topic, category } = getRandomTopic();

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



app.post("/api/streak/update", async (req, res) => {
  const { uid, email } = req.body;
  const streak = await updateUserStreak(uid, email);
  res.json({ streak });
});

app.get("/api/streak/:uid", async (req, res) => {
  const streak = await getUserStreak(req.params.uid);
  res.json({ streak });
});


/* --------------------------------------------------
   START SERVER
--------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GD Backend running on port ${PORT}`);
});

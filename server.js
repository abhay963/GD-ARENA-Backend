import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

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
  "Impact of Social Networking Sites",
  "Is Social Media Actually Connecting People?",
  "Tobacco must be banned. Yes or No.",
  "Mars Mission for India Justified?",
  "Is India ready for Electric Vehicles?",
  "Walmart and Flipkart Deal: Impact on Indian Economy",
  "Role of Engineers in Disaster Management",
  "Which is more important: Creativity or Efficiency?",
  "Should India have a One Child Policy?",
  "Farmers' Income: Will India be able to double it in next 5 years?",
  "Difficulties in Implementation of Climate Change Summit Resolutions",
  "Gold Monetization Scheme",
  "Regional languages in India are fading out in today's world.",
  "Should Triple Talaq be Banned in India or Not?",
  "Will Indian economy grow faster with reduced Goods and Services Tax (GST)?",
  "Is GST really a One nation, One tax system?",
  "Make in India vs Make for India",
  "Black Money in India",
  "Future of Sports in India",
  "Future of Crypto Currencies",
  "Is the World Ready for Cashless Currency?",
  "Demonetisation has reduced Corruption, Black Money and Terrorism?",
  "Education industry is a business these days.",
  "Whether Digital Education has taken over Traditional Education?",
  "Impact of Technology on Jobs",
  "Making Aadhaar Mandatory: Benefits and Drawbacks",
  "Is the Aadhaar database secured enough?",
  "Merits and Demerits of Cashless Economy",
  "Digital India: Whom Does it Benefit?",
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
  "Farmers’ income: Can India double it?",
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
  "Placement scenario in India",
   "Problems unite us, religion divides us",
  "Can India dream of hosting the Olympics?",
  "Emotional Intelligence vs Intelligence Quotient",
  "Economic growth is more important than ecological protection",
  "Fighting corruption is a mirage unless top public figures are punished",
  "Non-execution of the GST bill and its political impact",
  "Is the youth of India confident or confused?",
  "Youth participation in politics",
  "Chinese goods vs Indian goods",
  "Is compulsory attendance really needed in colleges?",
  "Should the national anthem be played in cinema halls?",
  "Is it fair to exempt political parties from income tax investigation?",
  "Does India need a complete overhaul of its education system?",
  "One Nation One Election: Pros and cons",
  "Should Hindi be the official language of India?",
  "India as a manufacturing hub: Dream or practical reality?",
  "Polythene bags must be banned",
  "Do we really need smart cities?",
  "Impact of technology on the banking sector",
  "Is Reliance Jio a sustainable business model in India?",
  "Should social media platforms clarify content removal policies?",
  "Demonetization: Corruption uprooted or just transformed?",
  "Impact of demonetization on common citizens",
  "Are digital payments secure enough for a cashless economy?",
  "Extra-curricular activities should be compulsory in schools",
  "Marriage is a social trap",
  "The internet is more hype than help",
  "Legalizing gambling in India",
  "The education system needs serious reforms",
  "India is not serious about saving wildlife and the environment",
  "Our culture is decaying",
  "Social evils and changing Indian society",
  "Is remixing a good trend in music?",
  "Influence of online social networks on youth",
  "Should prostitution be legalized in India?",
  "Individual freedom vs civil society",
  "Classical music heritage vs growing pop culture",
  "Should violence and crime be censored in films and television?",
  "Women empowerment and its impact on Indian families",
  "Women in defense services: Challenges and opportunities",
  "Does moral policing really protect Indian culture?",
  "Media censorship: Need of the hour?",
  "Should rapists be given the death penalty?",
  "Foreign television channels and cultural impact",
  "Censorship in movies and its effect on society",
  "Should dance bars be banned?",
  "Declining morals and values in Indian society",
  "Are films corrupting Indian youth?",
  "Are beauty contests degrading womanhood?",
  "Love marriages vs arranged marriages",
  "Effects of television on youth",
  "Should smoking be banned completely?",
  "Religion should not be mixed with politics",
  "Terrorism in India: Causes and solutions",

  /* ---------------- ABSTRACT GD TOPICS ---------------- */

  "Black",
  "White",
  "Grey",
  "Red vs Green",
  "The Power of Silence",
  "Change is the only constant",
  "Freedom is a myth",
  "Success has many fathers, failure is an orphan",
  "Means are more important than ends",
  "Leader or follower",
  "Wisdom vs knowledge",
  "Dreams convert into reality through action",
  "Reality is often disappointing",
  "Time and tide wait for none",
  "The road less traveled",
  "Comfort zone is the enemy of growth",
  "Nothing succeeds like success",
  "Vision without execution is hallucination",
  "The Nostradamus Code and the possibility of World War III",
  "Just as we have smoke-free zones, should we have child-free zones?",
  "Up the Down Staircase",
  "When I woke up this morning, I realized",
  "Group task: How can we bring Mount Everest to India?",
  "If I were the Finance Minister of India",
  "If I were the Prime Minister of India",
  "The wheel of time keeps turning",
  "All work and no play makes Jack a dull boy",
  "Nice guys finish last",
  "Too much honesty can be harmful",
  "Cleanliness as a fundamental responsibility of Indian citizens",
  "Men are from Mars, women are from Venus",
  "In today’s world, nothing is certain except death and taxes",
  "Good things always come from good thinking",
  "Is God male?",
  "Is love precious or poisonous?",
  "There is no right way of doing the wrong thing",
  "Let sleeping dogs lie",
  "Food comes first, ethics later",
  "Rules are meant to be broken",
  "Every cloud has a silver lining",
  "Do beauty and brains go together?",
  "A ship docked in harbor cannot face storms",

  /* -------- EDUCATION & MANAGEMENT GD TOPICS -------- */

  "How effective are Indian B-Schools?",
  "Should management education be subsidized?",
  "Private educational institutions: Good or bad?",
  "Is reservation in higher education the only solution for social equality?",
  "E-learning as a substitute for classroom learning",
  "Entry of foreign universities in India",
  "Should the government invest more in IITs and IIMs or in primary and secondary education?",
  "Privatization of higher education",
  "Government control in higher education: Necessary or interference?",
  "Do we really need education to be successful?",
  "Have examinations killed real education?",
  "Advantages of co-education",

  /* -------- ABSTRACT & CREATIVE GD TOPICS -------- */

  "The wheel is always turning",
  "Thinking beyond boundaries",
  "Life is a game of choices",
  "Success demands sacrifice",
  "Comfort zones limit growth",
  "Dreams without action remain illusions",
  "Truth is stranger than fiction",
  "Change begins with self",
  "Risk is better than regret"

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

/* --------------------------------------------------
   START SERVER
--------------------------------------------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GD Backend running on port ${PORT}`);
});

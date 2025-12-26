
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
   ENHANCED GD TOPICS (EXPANDED COLLECTION)
--------------------------------------------------- */
const GD_TOPICS = [
  "Digital detox: Necessary break?",
  "Juvenile Crime",
  "Startup culture among engineering students: Encouraged or overhyped?",
  "Electoral reforms: For better democracy",
  "Music streaming: Industry transformation",
  "Freedom is a myth",
  "Reservation System",
  "Mentorship programs: Impact on careers",
  "Digital colonialism: New form of imperialism",
  "Sports betting: Should be legalized?",
  "Make in India: Progress and challenges",
  "Caste discrimination in modern India",
  "Sleep deprivation: Modern epidemic",
  "Influence of Western Culture",
  "3D printing: Manufacturing revolution",
  "Drug abuse among youth: Growing menace",
  "Is blockchain technology beyond cryptocurrency?",
  "Nuclear Power",
  "Technology addiction: Growing concern",
  "Is T20 cricket killing real cricket skills?",
  "Women empowerment: Myth or reality?",
  "Genetically Modified Food",
  "Ocean cleanup: Feasibility and impact",
  "Gig economy: Future of work?",
  "Censorship in media: Necessary evil?",
  "Cloud computing: Revolution or evolution?",
  "Beti Padhao will enable Beti Bachao",
  "Impact of technology on jobs",
  "Each One Teach One should be made compulsory",
  "UPI going global: Can Indian fintech lead the world?",
  "Organic food: Worth the price?",
  "Will AI replace engineers?",
  "Right to privacy: Fundamental right?",
  "Vaccination: Personal choice or public duty?",
  "Road safety: Need for stricter laws",
  "Big data: Privacy concerns",
  "Digital currency: Future of money",
  "Success: Definition in modern world",
  "Death penalty for crimes against women",
  "Research funding: Government vs private",
  "Cricket vs other sports: Imbalanced priority",
  "Farmers' income: Can India double it?",
  "Is nuclear energy safe and sustainable?",
  "What is best for an individual is not necessarily best for society",
  "Plastic pollution: Engineering solutions",
  "Sports education in schools: Neglected area?",
  "Cybersecurity: Are engineers doing enough?",
  "Will India become a superpower?",
  "Digital divide: Bridging the gap",
  "Ethics in artificial intelligence: Who is accountable?",
  "Offices should adopt a four-day work week",
  "Corruption is a necessary evil",
  "Mental health: Taboo in society",
  "Our culture is decaying",
  "Machine learning in healthcare: Pros and cons",
  "Child Labour",
  "Cashless economy: Is society ready for transformation?",
  "Digital governance: Efficiency vs privacy",
  "Happiness: Pursuit or byproduct?",
  "Biometric data: Privacy vs security",
  "Foreign education: Worth the investment?",
  "Surrogate motherhood: Ethical concerns",
  "Cyber Crime",
  "Skilled manpower shortage in India",
  "The dark side of junk food is still unknown",
  "Esports: Real sport or just gaming?",
  "Green engineering: The need of the hour",
  "Deforestation: Can technology help?",
  "Robotics in manufacturing: Job killer or job creator?",
  "LGBTQ+ rights in workplace",
  "Space tourism: The future of engineering innovation?",
  "Practical knowledge vs theoretical knowledge",
  "Quantum supremacy: Hype or reality?",
  "UN plays an important role in global peacekeeping",
  "Minimalism: Solution to consumerism?",
  "Internet of Things (IoT): Boon or threat to personal privacy?",
  "Stress management: Need of the hour",
  "AFSPA",
  "Women in sports: Equal opportunities?",
  "Make in India: Can it make India a manufacturing hub?",
  "Corporate training vs formal education",
  "Digital India: Success or failure?",
  "Work-life balance: Myth or achievable?",
  "Algorithmic bias: Fairness in AI",
  "Metaverse: Real opportunity or just a buzzword?",
  "Space militarization: Global threat?",
  "Healthcare accessibility: Urban-rural divide",
  "Euthanasia: Right to die?",
  "Social media regulation: Free speech vs control",
  "Police reforms: Urgent need",
  "Online education: Future of learning?",
  "Cryptocurrency regulation: Need of the hour",
  "Organic Farming",
  "Technology in defense: Modern warfare",
  "LGBTQ+ marriage: Legal recognition",
  "Alternative medicine: Science or superstition?",
  "Quantum computing: Threat or opportunity?",
  "India's Moon and Mars missions: National pride or misplaced priorities?",
  "Waste management: Innovative approaches",
  "Reality shows: Entertainment or exploitation?",
  "Russian-Ukraine War",
  "Social media's impact on mental health",
  "Engineering brain drain: Is it still a problem in India?",
  "Tier-1 vs Tier-3 college students: Who has better placement opportunities?",
  "Yoga vs gym: Better fitness choice",
  "Water scarcity: Technological interventions",
  "Neural implants: Enhancement or invasion?",
  "English must remain the official language of India",
  "NATO and its relevance",
  "Sanitation: Basic right or privilege?",
  "Is India ready for a cashless economy?",
  "Autonomous weapons: Ethical implications",
  "Unionization in the private sector is essential",
  "Courage to accept and dedication to improve are keys to success",
  "Technology vs ethics: Where should we draw the line?",
  "Nuclear Proliferation",
  "Global tech layoffs: Lessons for Indian engineers",
  "Rise of deepfake technology: Should it be banned?",
  "The quota system should be completely removed",
  "Entrepreneurship in curriculum: Necessary?",
  "Internal Situation of Pakistan",
  "Banking scams in India",
  "Justice Delayed is Justice Denied",
  "FDI in Defence Sector",
  "ISRO",
  "Brain Drain",
  "Digital dependency among youth",
  "Work from home — future or temporary?",
  "Is social media damaging technical creativity?",
  "Gender pay gap in tech industry",
  "India should not invest in space programs",
  "Division of States",
  "West Asia Crisis",
  "Sports in India",
  "Tourism in India",
  "India’s Role in World Forum",
  "Higher Education in India",
  "World Trade Organization",
  "NDRF",
  "Changing World Order",
  "Emergence of Multipolar World",
  "Arms Race",
  "Global Uncertainties",
  "Farm laws Boon or Bane",
  "Agniveer",
  "CAA",
  "NRC",
  "Rural Development in India",
  "Poverty Eradication",
  "Coastal Security",
  "Organ Trafficking",
  "South China Sea",
  "World Bank",
  "Coalition Politics",
  "World Energy Crisis",
  "Dynastic Politics",
  "India Missile Program",
  "Constitutional Reforms",
  "FDI in Defence Sector",
  "Sponsorship in Sports",
  "Sex Education",
  "ISIS",
  "Arab Spring",
  "Role of India in United Nation",
  "Naxalism",
  "Fundamental Rights",
  "RT E (Right to Education)",
  "Indian Economy",
  "Indian Foreign Policy",
  "Senior Citizens",
  "Role of NGOs",
  "Mercy Killing",
  "Religious Fundamentalism",
  "Influence of Western Culture",
  "World Bank",
  "South Asian societies are shaped more by culture than the state",
  "Leader or follower",
  "Fact vs opinion"
];



// Track recently used topics to avoid immediate repetition
let recentlyUsedTopics = new Set();
const MAX_RECENT_TOPICS = 10; // Remember last 10 topics

/* --------------------------------------------------
   CATEGORY MAPPING (ENHANCED)
--------------------------------------------------- */
function detectCategory(topic) {
  const lowerTopic = topic.toLowerCase();
  
  // Technology & Innovation
  if (lowerTopic.includes("ai") || lowerTopic.includes("technology") || 
      lowerTopic.includes("digital") || lowerTopic.includes("blockchain") ||
      lowerTopic.includes("quantum") || lowerTopic.includes("robotics") ||
      lowerTopic.includes("iot") || lowerTopic.includes("cyber") ||
      lowerTopic.includes("metaverse") || lowerTopic.includes("5g") ||
      lowerTopic.includes("cloud") || lowerTopic.includes("machine") ||
      lowerTopic.includes("virtual") || lowerTopic.includes("3d") ||
      lowerTopic.includes("neural") || lowerTopic.includes("biometric")) {
    return "Technology & Innovation";
  }
  
  // Environment & Sustainability
  if (lowerTopic.includes("climate") || lowerTopic.includes("environment") ||
      lowerTopic.includes("green") || lowerTopic.includes("sustainable") ||
      lowerTopic.includes("renewable") || lowerTopic.includes("carbon") ||
      lowerTopic.includes("plastic") || lowerTopic.includes("water") ||
      lowerTopic.includes("energy") || lowerTopic.includes("pollution") ||
      lowerTopic.includes("deforestation") || lowerTopic.includes("waste")) {
    return "Environment & Sustainability";
  }
  
  // Business & Economy
  if (lowerTopic.includes("economy") || lowerTopic.includes("gst") ||
      lowerTopic.includes("economy") || lowerTopic.includes("business") ||
      lowerTopic.includes("trade") || lowerTopic.includes("bank") ||
      lowerTopic.includes("cashless") || lowerTopic.includes("startup") ||
      lowerTopic.includes("investment") || lowerTopic.includes("gig") ||
      lowerTopic.includes("privatization") || lowerTopic.includes("make in india")) {
    return "Business & Economy";
  }
  
  // Social Issues
  if (lowerTopic.includes("social") || lowerTopic.includes("women") ||
      lowerTopic.includes("gender") || lowerTopic.includes("caste") ||
      lowerTopic.includes("lgbt") || lowerTopic.includes("domestic") ||
      lowerTopic.includes("child") || lowerTopic.includes("elderly") ||
      lowerTopic.includes("sanitation") || lowerTopic.includes("healthcare")) {
    return "Social Issues";
  }
  
  // Education & Career
  if (lowerTopic.includes("education") || lowerTopic.includes("career") ||
      lowerTopic.includes("internship") || lowerTopic.includes("placement") ||
      lowerTopic.includes("college") || lowerTopic.includes("learning") ||
      lowerTopic.includes("skill") || lowerTopic.includes("research") ||
      lowerTopic.includes("curriculum") || lowerTopic.includes("mentor")) {
    return "Education & Career";
  }
  
  // Ethics & Philosophy
  if (lowerTopic.includes("ethics") || lowerTopic.includes("moral") ||
      lowerTopic.includes("philosophy") || lowerTopic.includes("values") ||
      lowerTopic.includes("wisdom") || lowerTopic.includes("freedom") ||
      lowerTopic.includes("truth") || lowerTopic.includes("leader") ||
      lowerTopic.includes("impossible") || lowerTopic.includes("happiness")) {
    return "Ethics & Philosophy";
  }
  
  // Politics & Governance
  if (lowerTopic.includes("politics") || lowerTopic.includes("government") ||
      lowerTopic.includes("democracy") || lowerTopic.includes("election") ||
      lowerTopic.includes("policy") || lowerTopic.includes("law") ||
      lowerTopic.includes("judicial") || lowerTopic.includes("afspa") ||
      lowerTopic.includes("article") || lowerTopic.includes("citizenship")) {
    return "Politics & Governance";
  }
  
  // Sports & Entertainment
  if (lowerTopic.includes("cricket") || lowerTopic.includes("sports") ||
      lowerTopic.includes("olympics") || lowerTopic.includes("esports") ||
      lowerTopic.includes("netflix") || lowerTopic.includes("entertainment") ||
      lowerTopic.includes("media") || lowerTopic.includes("cinema") ||
      lowerTopic.includes("music") || lowerTopic.includes("celebrity")) {
    return "Sports & Entertainment";
  }
  
  // Health & Lifestyle
  if (lowerTopic.includes("health") || lowerTopic.includes("diet") ||
      lowerTopic.includes("food") || lowerTopic.includes("fitness") ||
      lowerTopic.includes("yoga") || lowerTopic.includes("sleep") ||
      lowerTopic.includes("mental") || lowerTopic.includes("obesity") ||
      lowerTopic.includes("stress") || lowerTopic.includes("junk")) {
    return "Health & Lifestyle";
  }
  
  return "Current Affairs";
}

/* --------------------------------------------------
   ENHANCED RANDOM TOPIC PICKER
--------------------------------------------------- */
function getRandomTopic() {
  let availableTopics = GD_TOPICS.filter(topic => !recentlyUsedTopics.has(topic));
  
  // If all topics have been used recently, reset and pick from all
  if (availableTopics.length === 0) {
    recentlyUsedTopics.clear();
    availableTopics = [...GD_TOPICS];
  }
  
  // Better randomization using crypto API if available
  let index;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomArray = new Uint32Array(1);
    crypto.getRandomValues(randomArray);
    index = randomArray[0] % availableTopics.length;
  } else {
    index = Math.floor(Math.random() * availableTopics.length);
  }
  
  const topic = availableTopics[index];
  const category = detectCategory(topic);
  
  // Update recently used topics
  recentlyUsedTopics.add(topic);
  if (recentlyUsedTopics.size > MAX_RECENT_TOPICS) {
    const oldestTopic = recentlyUsedTopics.values().next().value;
    recentlyUsedTopics.delete(oldestTopic);
  }
  
  return { topic, category };
}

/* --------------------------------------------------
   API 1️⃣: START GD (Enhanced with better prompts)
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
- 2-3 lines each
- No greetings
- Player 1: aggressive debater who takes strong stance
- Player 2: calm logical analyst who presents balanced view
- Both should address the topic directly
- Make it engaging and thought-provoking

Topic: ${topic}
Category: ${category}
`;

    const openingRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: openingPrompt }],
        temperature: 0.9, // Add some randomness
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
      totalTopics: GD_TOPICS.length,
    });
  } catch (error) {
    console.error("START GD ERROR:", error.message);
    res.status(500).json({ error: "Failed to start GD" });
  }
});

/* --------------------------------------------------
   API 2️⃣: CONTINUE GD (Enhanced)
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
- 13-16 lines max
- Player 1: strong stance, questions assumptions, pushes the debate
- Player 2: analytical, connects points, structures arguments clearly
- Respond to the user directly when relevant
- Use practical examples, short statistics, or quotes (not overused)
- Explore multiple angles: ethical, technical, economic, social, global, future impact
- Suggest solutions instead of only pointing problems
- Avoid repetition or generic filler lines
- Do NOT summarize — keep the discussion moving forward

Naturalness:
They should sound like actual GD participants on campus — thoughtful, curious, sometimes challenging, but always respectful.
- Avoid repetition
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
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
   NEW API: Get available topics by category
--------------------------------------------------- */
app.get("/api/topics", (req, res) => {
  const { category } = req.query;
  
  if (!category) {
    // Return all topics with categories
    const topicsWithCategories = GD_TOPICS.map(topic => ({
      topic,
      category: detectCategory(topic)
    }));
    res.json({ topics: topicsWithCategories });
  } else {
    // Filter by category
    const filteredTopics = GD_TOPICS.filter(topic => 
      detectCategory(topic) === category
    );
    res.json({ 
      topics: filteredTopics.map(topic => ({ topic, category })),
      count: filteredTopics.length
    });
  }
});

/* --------------------------------------------------
   NEW API: Get topic statistics
--------------------------------------------------- */
app.get("/api/stats", (req, res) => {
  const categoryCount = {};
  
  GD_TOPICS.forEach(topic => {
    const category = detectCategory(topic);
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });
  
  res.json({
    totalTopics: GD_TOPICS.length,
    categories: categoryCount,
    recentlyUsed: Array.from(recentlyUsedTopics)
  });
});

/* --------------------------------------------------
   Streak APIs (unchanged)
--------------------------------------------------- */
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
  console.log(`🚀 Enhanced GD Backend running on port ${PORT}`);
  console.log(`Hey Abhay Back Again`);

});
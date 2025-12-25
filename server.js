
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
  // Technology & Innovation
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
  "Biometric data: Privacy vs security",
  "Autonomous weapons: Ethical implications",
  "Digital currency: Future of money",
  "Cloud computing: Revolution or evolution?",
  "Machine learning in healthcare: Pros and cons",
  "Virtual reality in education: Game changer?",
  "3D printing: Manufacturing revolution",
  "Big data: Privacy concerns",
  "Neural implants: Enhancement or invasion?",
  "Quantum supremacy: Hype or reality?",

  // Environment & Sustainability
  "Green engineering: The need of the hour",
  "Can India achieve net-zero emissions by 2070?",
  "Is nuclear energy safe and sustainable?",
  "Engineering solutions for climate change",
  "Smart infrastructure vs natural preservation",
  "Plastic pollution: Engineering solutions",
  "Renewable energy: Is 100% renewable possible?",
  "Water scarcity: Technological interventions",
  "Sustainable urban planning: Challenges",
  "Carbon capture technology: Viable solution?",
  "Ocean cleanup: Feasibility and impact",
  "Deforestation: Can technology help?",
  "Air pollution control: Effective measures",
  "Sustainable agriculture: Role of technology",
  "Waste management: Innovative approaches",

  // Career & Education
  "Should coding be mandatory for all engineering streams?",
  "Are Indian engineering students industry-ready?",
  "Internships vs research: What is more valuable?",
  "Tier-1 vs Tier-3 college students: Who has better placement opportunities?",
  "Startup culture among engineering students: Encouraged or overhyped?",
  "Online education: Future of learning?",
  "Skill-based hiring vs degree-based hiring",
  "Gap year: Beneficial or detrimental?",
  "Foreign education: Worth the investment?",
  "Corporate training vs formal education",
  "Entrepreneurship in curriculum: Necessary?",
  "Research funding: Government vs private",
  "Practical knowledge vs theoretical knowledge",
  "Continuous learning: Essential in tech era",
  "Mentorship programs: Impact on careers",

  // Ethics & Society
  "Ethics in artificial intelligence: Who is accountable?",
  "Is social media damaging technical creativity?",
  "Should engineers have mandatory social service internships?",
  "Technology vs ethics: Where should we draw the line?",
  "Engineering brain drain: Is it still a problem in India?",
  "Data privacy: Fundamental right?",
  "Algorithmic bias: Fairness in AI",
  "Tech monopolies: Need for regulation?",
  "Digital divide: Bridging the gap",
  "Technology addiction: Growing concern",
  "Surveillance capitalism: Ethical implications",
  "Genetic engineering: Playing God?",
  "Digital colonialism: New form of imperialism",
  "Tech for social good: Myth or reality?",
  "Intellectual property: Innovation barrier?",

  // Current Affairs & Politics
  "Impact of AI tools like ChatGPT on engineering education",
  "India's Moon and Mars missions: National pride or misplaced priorities?",
  "UPI going global: Can Indian fintech lead the world?",
  "Global tech layoffs: Lessons for Indian engineers",
  "Rise of deepfake technology: Should it be banned?",
  "Digital India: Success or failure?",
  "Make in India: Progress and challenges",
  "Smart cities mission: Urban transformation?",
  "Digital governance: Efficiency vs privacy",
  "Technology in elections: Boon or bane?",
  "Social media regulation: Free speech vs control",
  "Cryptocurrency regulation: Need of the hour",
  "Data localization: Pros and cons",
  "Technology in defense: Modern warfare",
  "Space militarization: Global threat?",

  // Social Issues
  "Are beauty contests degrading womanhood?",
  "Our culture is decaying",
  "Educational qualification for politics",
  "Is our political system responsible for backwardness?",
  "Social media's impact on mental health",
  "Gender pay gap in tech industry",
  "Caste discrimination in modern India",
  "LGBTQ+ rights in workplace",
  "Child labor: Still a reality?",
  "Domestic violence: Hidden pandemic",
  "Elderly care: Society's responsibility",
  "Drug abuse among youth: Growing menace",
  "Road safety: Need for stricter laws",
  "Sanitation: Basic right or privilege?",
  "Healthcare accessibility: Urban-rural divide",

  // Sports & Entertainment
  "Is T20 cricket killing real cricket skills?",
  "Will India become a superpower?",
  "Should India announce a sports holiday?",
  "Olympics: Worth the investment?",
  "Cricket vs other sports: Imbalanced priority",
  "Esports: Real sport or just gaming?",
  "Sports betting: Should be legalized?",
  "Performance-enhancing drugs: Fair play?",
  "Sports education in schools: Neglected area?",
  "Women in sports: Equal opportunities?",
  "Netflix revolution: Changing entertainment",
  "Censorship in media: Necessary evil?",
  "Celebrity culture: Society's obsession",
  "Reality shows: Entertainment or exploitation?",
  "Music streaming: Industry transformation",

  // Philosophy & Abstract
  "Wisdom finds truth",
  "Values are not what humanity is, but what humanity ought to be",
  "What is best for an individual is not necessarily best for society",
  "Courage to accept and dedication to improve are keys to success",
  "South Asian societies are shaped more by culture than the state",
  "Change is the only constant",
  "Freedom is a myth",
  "Fact vs opinion",
  "Leader or follower",
  "Means vs ends",
  "Effective manager vs ethical manager",
  "Women empowerment: Myth or reality?",
  "Impossible or I am possible?",
  "Success: Definition in modern world",
  "Happiness: Pursuit or byproduct?",

  // Business & Economy
  "High oil prices and ways to deal with them",
  "Skilled manpower shortage in India",
  "Chinese goods vs Indian goods",
  "Cashless economy: Is society ready for transformation?",
  "Impact of technology on jobs",
  "Merger of public sector banks: How beneficial is it?",
  "GST: Will the economy grow faster with reduced tax rates?",
  "Farmers' income: Can India double it?",
  "Privatization of the Indian economy",
  "Make in India: Can it make India a manufacturing hub?",
  "US trade policy and global trade wars",
  "Banking scams in India",
  "Is India ready for a cashless economy?",
  "Startup ecosystem: Bubble or boom?",
  "Gig economy: Future of work?",

  // Legal & Governance
  "Issues over Article 370",
  "Death penalty for crimes against women",
  "Living relationships: Should they be banned?",
  "Uniform civil code: Need of the hour?",
  "Judicial reforms: Pending agenda",
  "Police reforms: Urgent need",
  "Electoral reforms: For better democracy",
  "Right to privacy: Fundamental right?",
  "AFSPA: Necessary or draconian?",
  "Citizenship Amendment Act: Divisive or unifying?",
  "Triple talaq: Women's rights victory?",
  "LGBTQ+ marriage: Legal recognition",
  "Euthanasia: Right to die?",
  "Surrogate motherhood: Ethical concerns",
  "Juvenile justice: Age of responsibility",

  // Health & Lifestyle
  "The dark side of junk food is still unknown",
  "Overdependence on diet products is ruining our health",
  "We have lost the importance of fruits in our diet",
  "Mental health: Taboo in society",
  "Yoga vs gym: Better fitness choice",
  "Work-life balance: Myth or achievable?",
  "Sleep deprivation: Modern epidemic",
  "Vaccination: Personal choice or public duty?",
  "Alternative medicine: Science or superstition?",
  "Obesity: Growing health crisis",
  "Stress management: Need of the hour",
  "Digital detox: Necessary break?",
  "Organic food: Worth the price?",
  "Fast fashion: Environmental cost",
  "Minimalism: Solution to consumerism?",

  // Miscellaneous
  "English must remain the official language of India",
  "A borderless world is practically impossible",
  "Corruption is a necessary evil",
  "UN plays an important role in global peacekeeping",
  "China is lagging behind India in software",
  "The quota system should be completely removed",
  "There is a serious lack of work-life balance today",
  "The age of wireless technology has arrived",
  "WhatsApp is more harmful than useful",
  "Social media is responsible for religious conflicts in India",
  "Unionization in the private sector is essential",
  "Offices should adopt a four-day work week",
  "India should not invest in space programs",
  "Beti Padhao will enable Beti Bachao",
  "Each One Teach One should be made compulsory"
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
- 15-20 lines max
- Maintain character consistency
- Player 1: aggressive, challenges viewpoints
- Player 2: analytical, provides balanced perspective
- Reference user's points when relevant
- Keep the discussion flowing
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
  console.log(`📚 Total topics available: ${GD_TOPICS.length}`);
  console.log(`🎯 Topic variety: ${Object.keys([...new Set(GD_TOPICS.map(t => detectCategory(t)))]).length} categories`);
});
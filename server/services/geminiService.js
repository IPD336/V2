const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables. AI features will fallback to placeholders.");
}

async function getGeminiModel() {
  return model;
}

async function generateProposal(senderName, receiverName, skillOffered, skillWanted) {
  const m = await getGeminiModel();
  if (!m) {
    return `Hi ${receiverName}, I'd love to swap my skills in ${skillOffered} for your expertise in ${skillWanted}. Let me know if you are interested in collaborating!`;
  }

  const prompt = `Write a short, engaging, and professional 2-3 sentence skill swap proposal message.
  Sender: ${senderName} (wants to offer/teach: ${skillOffered})
  Receiver: ${receiverName} (wants to learn/offers: ${skillWanted})
  Keep it friendly, collaborative, and concise. Write directly as ${senderName} to ${receiverName}. Do not include placeholders, quotes around the message, or subjects.`;

  try {
    const result = await m.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("Gemini proposal generation error:", err);
    return `Hi ${receiverName}, I'd love to swap my skills in ${skillOffered} for your expertise in ${skillWanted}. Let me know if you are interested in collaborating!`;
  }
}

async function summarizeReviews(reviews) {
  const m = await getGeminiModel();
  if (!m || !reviews || reviews.length === 0) {
    return "This mentor consistently receives positive ratings and has successfully completed multiple skill exchanges.";
  }

  const reviewTexts = reviews.map(r => `- Rating: ${r.rating}/5. Learned: ${r.learned || 'N/A'}. Feedback: "${r.feedback || ''}"`).join('\n');
  const prompt = `Analyze the following user reviews from a skill-sharing platform and write a brief, cohesive 2-sentence summary of this user's teaching style, strengths, and feedback. Keep it constructive, positive, and direct. Do not mention specific names of reviewers. Do not use markdown bullet lists.

Reviews:\n${reviewTexts}`;

  try {
    const result = await m.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("Gemini review summarization error:", err);
    return "This mentor consistently receives positive ratings and has successfully completed multiple skill exchanges.";
  }
}

async function inferGithubSkills(repos) {
  const m = await getGeminiModel();
  if (!m || !repos || repos.length === 0) {
    return [
      { name: "JavaScript", category: "Development" },
      { name: "React", category: "Development" }
    ];
  }

  const repoSummary = repos.map(r => `- ${r.name}: ${r.description || ''} (Language: ${r.language || 'Unknown'})`).slice(0, 20).join('\n');
  const prompt = `Based on the following list of GitHub repositories, infer a list of technical skills (e.g., programming languages, frameworks, tools) this user possesses. Group them into categories (e.g. Development, Design, Marketing, Business, Other).
  Return the output strictly as a JSON array of objects, with each object having exactly two fields: "name" (the skill, e.g., "React") and "category" (e.g., "Development"). Do not include any explanation, markdown formatting (such as \`\`\`json), or extra text.

Repositories:\n${repoSummary}`;

  try {
    const result = await m.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini GitHub skill inference error:", err);
    return [
      { name: "JavaScript", category: "Development" },
      { name: "React", category: "Development" }
    ];
  }
}

async function generateMatchExplanations(me, candidates) {
  const m = await getGeminiModel();
  if (!m) {
    return candidates.map(() => "You have matching skill categories that could make for a great swap.");
  }

  const myOffered = me.skillsOffered.map(s => s.name).join(', ');
  const myWanted = me.skillsWanted.join(', ');

  const candidateLines = candidates.map((c, i) => {
    const cOffered = c.skillsOffered.map(s => s.name).join(', ');
    const cWanted = c.skillsWanted.join(', ');
    return `Candidate ${i}: ${c.name}. Offers [${cOffered}], wants [${cWanted}].`;
  }).join('\n');

  const prompt = `You are a matchmaker for a skill exchange platform. For each candidate below, write one short, catchy sentence (max 15 words) explaining why they are a good match for User A.
User A offers [${myOffered}] and wants [${myWanted}].

${candidateLines}

Return your output strictly as a JSON array of strings, one per candidate in order. Do not include any explanation or markdown formatting.`;

  try {
    const result = await m.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }
    const explanations = JSON.parse(text);
    return candidates.map((c, i) => explanations[i] || "You have matching skill categories that could make for a great swap.");
  } catch (err) {
    console.error("Gemini match explanation error:", err);
    return candidates.map(() => "You have matching skill categories that could make for a great swap.");
  }
}

module.exports = {
  generateProposal,
  summarizeReviews,
  inferGithubSkills,
  generateMatchExplanations,
};

const { generateText, generateObject } = require('ai');
const { z } = require('zod');
const { aiGateway, MODELS } = require('./aiGateway');

/* ─── Cache ─── */
class GeminiCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    setInterval(() => this.cleanup(), 3600000);
  }
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  set(key, value, ttlMs) {
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
  cleanup() {
    if (this.cache.size === 0) return;
    const now = Date.now();
    for (const [key, item] of this.cache) {
      if (now > item.expiresAt) this.cache.delete(key);
    }
  }
}

const cache = new GeminiCache();

function cacheKey(...args) {
  return JSON.stringify(args);
}

const TTL = {
  PROPOSAL: 24 * 3600 * 1000,
  SUMMARY: 24 * 3600 * 1000,
  GITHUB: 7 * 24 * 3600 * 1000,
  MATCH: 3600 * 1000,
};

/* ─── generateProposal ─── */
async function generateProposal(senderName, receiverName, skillOffered, skillWanted) {
  const key = cacheKey('proposal', senderName, receiverName, skillOffered, skillWanted);
  const cached = cache.get(key);
  if (cached) return cached;

  const prompt = `Write a 2-sentence skill swap proposal as ${senderName} to ${receiverName}.
Offer: ${skillOffered}. Want: ${skillWanted}.
Friendly, professional, no quotes.`;

  try {
    const { text } = await generateText({
      model: aiGateway(MODELS.simple),
      prompt,
    });
    cache.set(key, text, TTL.PROPOSAL);
    return text;
  } catch (err) {
    console.error(`Gemini proposal error:`, err.message);
    return `Hi ${receiverName}, I'd love to swap my skills in ${skillOffered} for your expertise in ${skillWanted}. Let me know if you are interested in collaborating!`;
  }
}

/* ─── summarizeReviews ─── */
async function summarizeReviews(reviews) {
  if (!reviews || reviews.length === 0) return "No detailed reviews available to summarize.";

  const key = cacheKey('summary', reviews.map(r => r._id || r.feedback).join('|'));
  const cached = cache.get(key);
  if (cached) return cached;

  const texts = reviews.map(r =>
    `Rating: ${r.rating}/5. Learned: ${r.learned || 'N/A'}. Feedback: "${r.feedback || ''}"`
  ).join('\n');

  const prompt = `Summarize these skill-swap reviews in 2 sentences (teaching style, strengths, weaknesses):
${texts}
Be balanced. No names. No lists.`;

  try {
    const { text } = await generateText({
      model: aiGateway(MODELS.complex),
      prompt,
    });
    cache.set(key, text, TTL.SUMMARY);
    return text;
  } catch (err) {
    console.error(`Gemini summary error:`, err.message);
    return "Unable to generate review summary at this time.";
  }
}

/* ─── inferGithubSkills ─── */
async function inferGithubSkills(repos) {
  if (!repos || repos.length === 0) {
    return [{ name: "JavaScript", category: "Development" }, { name: "React", category: "Development" }];
  }

  const key = cacheKey('github', repos.map(r => r.name).join('|'));
  const cached = cache.get(key);
  if (cached) return cached;

  const summary = repos.slice(0, 15).map(r =>
    `- ${r.name}: ${r.description || ''} (${r.language || '?'})`
  ).join('\n');

  const prompt = `Infer technical skills from these GitHub repos.
Repos:\n${summary}
Respond ONLY with a valid JSON array of objects. Do NOT wrap it in markdown. Each object must have:
"name" (string)
"category" (string: one of 'Development', 'Design', 'Marketing', 'Business', 'Other')
Example: [{"name":"React","category":"Development"}]`;

  try {
    const { text } = await generateText({
      model: aiGateway(MODELS.simple),
      prompt,
    });
    
    // Attempt to parse JSON from the text, handling possible markdown wrappers
    let jsonStr = text.trim();
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    }
    
    const parsedSkills = JSON.parse(jsonStr);
    cache.set(key, parsedSkills, TTL.GITHUB);
    return parsedSkills;
  } catch (err) {
    console.error(`Gemini github-skills error:`, err.message);
    return [{ name: "JavaScript", category: "Development" }, { name: "React", category: "Development" }];
  }
}

/* ─── generateMatchExplanations ─── */
async function generateMatchExplanations(me, candidates) {
  if (!candidates || candidates.length === 0) return [];

  const key = cacheKey('match', me._id, candidates.map(c => c._id).join('|'));
  const cached = cache.get(key);
  if (cached) return cached;

  const myOffered = me.skillsOffered?.map(s => s.name).join(', ') || '';
  const myWanted = me.skillsWanted?.join(', ') || '';

  const lines = candidates.map((c, i) =>
    `C${i}: ${c.name}. Offers [${(c.skillsOffered||[]).map(s=>s.name).join(',')}], wants [${(c.skillsWanted||[]).join(',')}]`
  ).join('\n');

  const prompt = `Match explanations for skill swap. For each candidate, one short sentence (max 12 words).
User offers [${myOffered}], wants [${myWanted}].
${lines}

Respond ONLY with a valid JSON object. Do NOT wrap it in markdown. The object must contain an array called "explanations".
Example: {"explanations":["Match 1 explanation", "Match 2 explanation"]}`;

  try {
    const { text } = await generateText({
      model: aiGateway(MODELS.complex),
      prompt,
    });
    
    let jsonStr = text.trim();
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    }

    const parsed = JSON.parse(jsonStr);
    const result = candidates.map((_, i) => parsed.explanations[i] || "Good skill match!");
    cache.set(key, result, TTL.MATCH);
    return result;
  } catch (err) {
    console.error(`Gemini match error:`, err.message);
    return candidates.map(() => "You have matching skill categories that could make for a great swap.");
  }
}

module.exports = {
  generateProposal,
  summarizeReviews,
  inferGithubSkills,
  generateMatchExplanations,
};

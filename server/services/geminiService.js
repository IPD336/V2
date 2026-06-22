const { GoogleGenerativeAI } = require('@google/generative-ai');

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

/* ─── Timeout helper ─── */
function withTimeout(promise, ms = 10000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Gemini request timed out')), ms);
  });
  return Promise.race([promise.finally(() => clearTimeout(timer)), timeout]);
}

/* ─── Gemini model setup ─── */
let genAI = null;

const MODELS = {
  simple: 'gemini-1.5-flash',
  complex: 'gemini-2.5-flash',
};

const TASK_MODEL = {
  proposal: 'simple',
  'github-skills': 'simple',
  summary: 'complex',
  match: 'complex',
};

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will fallback to placeholders.");
}

function getGeminiModel(task) {
  const type = TASK_MODEL[task] || 'simple';
  return genAI ? genAI.getGenerativeModel({ model: MODELS[type] }) : null;
}

/* ─── Retry helper: try primary model, fallback to complex ─── */
async function generateWithRetry(task, prompt, parseFn) {
  const primary = getGeminiModel(task);
  if (!primary) return null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const m = attempt === 0 ? primary : (task === 'proposal' || task === 'github-skills' ? genAI.getGenerativeModel({ model: MODELS.complex }) : null);
    if (!m) continue;
    try {
      const result = await withTimeout(m.generateContent(prompt));
      const text = result.response.text().trim();
      return parseFn ? parseFn(text) : text;
    } catch (err) {
      console.error(`Gemini ${task} error (attempt ${attempt}):`, err.message);
    }
  }
  return null;
}

async function generateStream(task, prompt) {
  const m = getGeminiModel(task);
  if (!m) return null;
  try {
    const result = await m.generateContentStream(prompt);
    return result.stream;
  } catch (err) {
    console.error(`Gemini stream ${task} error:`, err.message);
    return null;
  }
}

/* ─── generateProposal ─── */
async function generateProposal(senderName, receiverName, skillOffered, skillWanted) {
  const key = cacheKey('proposal', senderName, receiverName, skillOffered, skillWanted);
  const cached = cache.get(key);
  if (cached) return cached;

  const prompt = `Write a 2-sentence skill swap proposal as ${senderName} to ${receiverName}.
Offer: ${skillOffered}. Want: ${skillWanted}.
Friendly, professional, no quotes.`;

  const result = await generateWithRetry('proposal', prompt);
  const fallback = `Hi ${receiverName}, I'd love to swap my skills in ${skillOffered} for your expertise in ${skillWanted}. Let me know if you are interested in collaborating!`;
  const output = result || fallback;
  cache.set(key, output, TTL.PROPOSAL);
  return output;
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

  const result = await generateWithRetry('summary', prompt);
  const output = result || "Unable to generate review summary at this time.";
  cache.set(key, output, TTL.SUMMARY);
  return output;
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

  const prompt = `Infer technical skills from these GitHub repos. Return JSON array of {name, category}.
Categories: Development, Design, Marketing, Business, Other.
No markdown, no explanation.

Repos:\n${summary}`;

  const parse = (text) => {
    const clean = text.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    return JSON.parse(clean);
  };

  const result = await generateWithRetry('github-skills', prompt, parse);
  const fallback = [{ name: "JavaScript", category: "Development" }, { name: "React", category: "Development" }];
  const output = result || fallback;
  cache.set(key, output, TTL.GITHUB);
  return output;
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
Return JSON array of strings. No markdown.`;

  const parse = (text) => {
    const clean = text.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    const arr = JSON.parse(clean);
    return candidates.map((_, i) => arr[i] || "Good skill match!");
  };

  const result = await generateWithRetry('match', prompt, parse);
  const fallback = candidates.map(() => "You have matching skill categories that could make for a great swap.");
  const output = result || fallback;
  cache.set(key, output, TTL.MATCH);
  return output;
}

module.exports = {
  generateProposal,
  summarizeReviews,
  inferGithubSkills,
  generateMatchExplanations,
};

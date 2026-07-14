const { createGroq } = require('@ai-sdk/groq');

// Initialize the Groq provider using Vercel AI SDK
// We route traffic through Groq to get access to insane speeds on open source models for $0
const aiGateway = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// We define our models here using Groq's model IDs
const MODELS = {
  simple: 'llama-3.3-70b-versatile',
  complex: 'llama-3.3-70b-versatile', 
};

module.exports = {
  aiGateway,
  MODELS
};

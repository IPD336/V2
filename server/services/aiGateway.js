const { createOpenRouter } = require('@openrouter/ai-sdk-provider');

// Initialize the OpenRouter provider using Vercel AI SDK
// We route the traffic through OpenRouter to get access to 100% free models like DeepSeek
const aiGateway = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// We define our models here using OpenRouter's model IDs
const MODELS = {
  simple: 'meta-llama/llama-3.3-70b-instruct:free',
  complex: 'meta-llama/llama-3.3-70b-instruct:free', 
};

module.exports = {
  aiGateway,
  MODELS
};

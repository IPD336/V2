const { createGoogleGenerativeAI } = require('@ai-sdk/google');

// Initialize the Google Generative AI provider using Vercel AI SDK
// We route the traffic through Helicone's Gateway to get rate-limit protection,
// caching, and analytics for $0.
const aiGateway = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  // If a Helicone key is provided, route through their gateway, otherwise use default
  baseURL: process.env.HELICONE_API_KEY 
    ? 'https://gateway.helicone.ai/gemini-api/v1beta' 
    : undefined,
  headers: process.env.HELICONE_API_KEY 
    ? {
        'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
      } 
    : undefined,
});

// We can define our models here to easily swap them later if needed
const MODELS = {
  simple: 'gemini-2.0-flash',
  complex: 'gemini-2.0-flash', // Using 2.0-flash for both to prevent 404s on deprecated models
};

module.exports = {
  aiGateway,
  MODELS,
};

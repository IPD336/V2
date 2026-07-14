const express = require('express');
const { streamText, stepCountIs } = require('ai');
const { aiGateway, MODELS } = require('../services/aiGateway');
const { findMatchesTool, getMyProfileTool } = require('../services/agentTools');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/chat', auth, async (req, res) => {
  try {
    const { messages } = req.body;
    const userId = req.user.id;

    // We inject the user ID into the context so the AI can use it when calling tools
    const systemPrompt = `You are the SkillSwap Autonomous Agent. Your job is to help the user find skill swap matches, draft proposals, and navigate the platform. 
    You have access to tools. The user's ID is: ${userId}. Use this ID when tools require it.
    If you need to find someone with a specific skill, use the findMatchesTool.
    Keep your answers concise and professional.`;

    const result = streamText({
      model: aiGateway(MODELS.simple),
      system: systemPrompt,
      messages,
      tools: {
        findMatchesTool,
        getMyProfileTool
      },
      // This is the equivalent of stepCountIs(10) in Vercel AI SDK to allow
      // the agent to call tools in a loop autonomously up to 10 times.
      maxSteps: 10,
    });

    result.pipeDataStreamToResponse(res);
  } catch (err) {
    console.error('Agent chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

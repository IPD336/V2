const { tool } = require('ai');
const { z } = require('zod');
const User = require('../models/User');

const findMatchesTool = tool({
  description: 'Find other users who match a specific skill requirement. Use this when the user asks to find someone who knows a certain skill.',
  parameters: z.object({
    skillToFind: z.string().describe('The specific skill the user is looking for (e.g., React, Python, Marketing)'),
    limit: z.number().default(5).describe('The maximum number of users to return')
  }),
  execute: async ({ skillToFind, limit }) => {
    try {
      const candidates = await User.find({
        isPublic: { $ne: false },
        role: { $ne: 'admin' },
        'skillsOffered.name': { $regex: new RegExp(skillToFind, 'i') }
      }).select('name skillsOffered skillsWanted rating').limit(limit).lean();

      if (candidates.length === 0) {
        return `No users found offering the skill: ${skillToFind}.`;
      }
      return candidates;
    } catch (err) {
      return `Error finding matches: ${err.message}`;
    }
  }
});

const getMyProfileTool = tool({
  description: 'Retrieve the current logged-in user\'s profile, including their skills offered and wanted.',
  parameters: z.object({
    userId: z.string().describe('The ID of the current user. Pass this explicitly from the server context.')
  }),
  execute: async ({ userId }) => {
    try {
      const user = await User.findById(userId).select('name skillsOffered skillsWanted').lean();
      return user || 'User profile not found.';
    } catch (err) {
      return `Error fetching profile: ${err.message}`;
    }
  }
});

module.exports = {
  findMatchesTool,
  getMyProfileTool,
};

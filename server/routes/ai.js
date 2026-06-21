const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Review = require('../models/Review');
const {
  generateProposal,
  summarizeReviews,
  inferGithubSkills,
  generateMatchExplanations
} = require('../services/geminiService');
const { validate, objectId, z } = require('../utils/validation');

const router = express.Router();

const draftProposalSchema = z.object({
  body: z.object({
    receiverId: objectId,
    skillOffered: z.string().min(1).max(100),
    skillWanted: z.string().min(1).max(100),
  }),
});

const githubVerifySchema = z.object({
  body: z.object({
    githubUrl: z.string().min(1, 'githubUrl is required'),
  }),
});

router.post('/draft-proposal', auth, validate(draftProposalSchema), async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted } = req.body;

    const receiver = await User.findById(receiverId).select('name');
    if (!receiver) {
      return res.fail('Receiver user not found', 404);
    }

    const me = await User.findById(req.user.id).select('name');
    if (!me) {
      return res.fail('Current user not found', 404);
    }

    const draft = await generateProposal(me.name, receiver.name, skillOffered, skillWanted);
    res.respond({ draft });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/reviews-summary/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId }).select('rating learned feedback');
    const summary = await summarizeReviews(reviews);
    res.respond({ summary });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.post('/github-verify', auth, validate(githubVerifySchema), async (req, res) => {
  try {
    const { githubUrl } = req.body;

    let username = githubUrl.trim();
    if (username.includes('github.com/')) {
      username = username.split('github.com/')[1].split('/')[0].split('?')[0];
    }

    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`, {
      headers: { 'User-Agent': 'SkillSwap-AI-App' }
    });

    let repoList = [];

    if (response.ok) {
      const repos = await response.json();
      if (Array.isArray(repos)) {
        repoList = repos.map(r => ({
          name: r.name,
          description: r.description,
          language: r.language
        }));
      }
    } else {
      const htmlResponse = await fetch(`https://github.com/${username}?tab=repositories`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (!htmlResponse.ok) {
         return res.fail('Could not fetch GitHub profile. Please check the username.', 400);
      }
      const html = await htmlResponse.text();
      const repoMatches = [...html.matchAll(/itemprop="name codeRepository"[^>]*>\s*([^<\n]+)\s*<\/a>/g)];
      repoList = repoMatches.slice(0, 20).map((match) => ({
        name: match[1].trim(),
        description: 'GitHub Repository',
        language: 'Code'
      }));

      if (repoList.length === 0) {
         return res.fail(`No public repositories found for ${username}, or GitHub blocked the request.`, 400);
      }
    }

    const suggestedSkills = await inferGithubSkills(repoList);
    res.respond({ skills: suggestedSkills });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

router.get('/smart-recommendations', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('skillsOffered skillsWanted').lean();
    if (!me) return res.fail('User not found', 404);

    if (!me.skillsOffered?.length && !me.skillsWanted?.length) {
      return res.respond({ recommendations: [] });
    }

    const { matchScore } = require('../services/matchService');

    const candidates = await User.find({
      isPublic: { $ne: false },
      role: { $ne: 'admin' },
      _id: { $ne: req.user.id },
    }).select('-passwordHash -savedProfiles').lean();

    const scored = candidates
      .map((u) => ({ ...u, score: matchScore(me, u) }))
      .filter((u) => u.score > 0)
      .sort((a, b) => b.score - a.score || (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);

    if (scored.length === 0) return res.respond({ recommendations: [] });

    const explanations = await generateMatchExplanations(me, scored);

    const smartRecommendations = scored.map((candidate, i) => ({
      ...candidate,
      aiMatchExplanation: explanations[i] || '',
    }));

    res.respond({ recommendations: smartRecommendations });
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;

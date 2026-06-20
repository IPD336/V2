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

const router = express.Router();

router.post('/draft-proposal', auth, async (req, res) => {
  try {
    const { receiverId, skillOffered, skillWanted } = req.body;
    if (!receiverId || !skillOffered || !skillWanted) {
      return res.status(400).json({ message: 'receiverId, skillOffered, and skillWanted are required' });
    }

    const receiver = await User.findById(receiverId).select('name');
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver user not found' });
    }

    const me = await User.findById(req.user.id).select('name');
    if (!me) {
      return res.status(404).json({ message: 'Current user not found' });
    }

    const draft = await generateProposal(me.name, receiver.name, skillOffered, skillWanted);
    res.json({ draft });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/reviews-summary/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId }).select('rating learned feedback');
    const summary = await summarizeReviews(reviews);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/github-verify', auth, async (req, res) => {
  try {
    const { githubUrl } = req.body;
    if (!githubUrl) {
      return res.status(400).json({ message: 'githubUrl is required' });
    }

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
         return res.status(400).json({ message: 'Could not fetch GitHub profile. Please check the username.' });
      }
      const html = await htmlResponse.text();
      const repoMatches = [...html.matchAll(/itemprop="name codeRepository"[^>]*>\s*([^<\n]+)\s*<\/a>/g)];
      repoList = repoMatches.slice(0, 20).map((match) => ({
        name: match[1].trim(),
        description: 'GitHub Repository',
        language: 'Code'
      }));

      if (repoList.length === 0) {
         return res.status(400).json({ message: `No public repositories found for ${username}, or GitHub blocked the request.` });
      }
    }

    const suggestedSkills = await inferGithubSkills(repoList);
    res.json({ skills: suggestedSkills });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/smart-recommendations', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('skillsOffered skillsWanted').lean();
    if (!me) return res.status(404).json({ message: 'User not found' });

    if (!me.skillsOffered?.length && !me.skillsWanted?.length) {
      return res.json([]);
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

    if (scored.length === 0) return res.json([]);

    const explanations = await generateMatchExplanations(me, scored);

    const smartRecommendations = scored.map((candidate, i) => ({
      ...candidate,
      aiMatchExplanation: explanations[i] || '',
    }));

    res.json(smartRecommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

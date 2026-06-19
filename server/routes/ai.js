const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Review = require('../models/Review');
const {
  generateProposal,
  summarizeReviews,
  inferGithubSkills,
  generateMatchExplanation
} = require('../services/geminiService');

const router = express.Router();

// 1. Proposal Draft Message
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

// 2. Reviews Summary
router.get('/reviews-summary/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId }).select('rating learned feedback');
    const summary = await summarizeReviews(reviews);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GitHub Skill Suggestion/Verification
router.post('/github-verify', auth, async (req, res) => {
  try {
    const { githubUrl } = req.body;
    if (!githubUrl) {
      return res.status(400).json({ message: 'githubUrl is required' });
    }

    // Extract username from URL or use as is
    let username = githubUrl.trim();
    if (username.includes('github.com/')) {
      username = username.split('github.com/')[1].split('/')[0].split('?')[0];
    }

    // Call GitHub API to list public repositories
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=30&sort=updated`, {
      headers: {
        'User-Agent': 'SkillSwap-AI-App'
      }
    });

    if (!response.ok) {
      return res.status(400).json({ message: 'Could not fetch GitHub repositories. Check your username.' });
    }

    const repos = await response.json();
    if (!Array.isArray(repos)) {
      return res.status(400).json({ message: 'Failed to retrieve repository data.' });
    }

    const repoList = repos.map(r => ({
      name: r.name,
      description: r.description,
      language: r.language
    }));

    const suggestedSkills = await inferGithubSkills(repoList);
    res.json({ skills: suggestedSkills });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Smart recommendations with Match Explanation
router.get('/smart-recommendations', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select('skillsOffered skillsWanted');
    if (!me) return res.status(404).json({ message: 'User not found' });

    // Fetch up to 15 potential match candidates
    const candidates = await User.find({
      isPublic: { $ne: false },
      role: { $ne: 'admin' },
      _id: { $ne: req.user.id },
    }).select('-passwordHash -savedProfiles').limit(15);

    // Filter down candidates that have match potential
    const matchTasks = candidates.map(async (candidate) => {
      const explanation = await generateMatchExplanation(me, candidate);
      return {
        ...candidate.toObject(),
        aiMatchExplanation: explanation
      };
    });

    const smartRecommendations = await Promise.all(matchTasks);
    res.json(smartRecommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

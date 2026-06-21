const express = require('express');
const auth = require('../middleware/auth');
const { getGamificationState, trackDailyStreak } = require('../services/gamificationService');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    await trackDailyStreak(req.user.id);
    const state = await getGamificationState(req.user.id);
    if (!state) return res.fail('User not found', 404);
    res.respond(state);
  } catch (err) {
    res.fail(err.message, 500);
  }
});

module.exports = router;

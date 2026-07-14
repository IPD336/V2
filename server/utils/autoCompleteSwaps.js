const Swap = require('../models/Swap');
const { SWAP_STATUS, STALE_SWAP_HOURS } = require('../constants');

async function autoCompleteStaleSwaps() {
  try {
    const staleHours = STALE_SWAP_HOURS;
    const cutoff = new Date(Date.now() - staleHours * 60 * 60 * 1000);
    const result = await Swap.updateMany(
      { status: SWAP_STATUS.PENDING_COMPLETION, completionRequestedAt: { $lt: cutoff } },
      { $set: { status: SWAP_STATUS.COMPLETED, completedAt: new Date() } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Auto-completed ${result.modifiedCount} stale swaps`);
    }
  } catch (err) {
    console.error('Failed to auto-complete stale swaps:', err.message);
  }
}

module.exports = { autoCompleteStaleSwaps };

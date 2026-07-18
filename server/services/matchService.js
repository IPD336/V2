function matchScore(me, other) {
  const myOffered = (me.skillsOffered || []).map((s) => s.name.toLowerCase());
  const myWanted = (me.skillsWanted || []).map((s) => s.toLowerCase());
  const theirOffered = (other.skillsOffered || []).map((s) => s.name.toLowerCase());
  const theirWanted = (other.skillsWanted || []).map((s) => s.toLowerCase());

  // How many of my offered skills does the other person want?
  const iGiveThemWant = myOffered.filter((s) => theirWanted.includes(s)).length;
  // How many of their offered skills do I want?
  const theyGiveMeWant = theirOffered.filter((s) => myWanted.includes(s)).length;

  const totalOverlap = iGiveThemWant + theyGiveMeWant;
  if (totalOverlap === 0) return 0;

  // Normalize to 0–100: max possible = all of my wants met + all of their wants met
  const maxPossible = (myWanted.length + theirWanted.length) || 1;
  return Math.min(100, Math.round((totalOverlap / maxPossible) * 100));
}

function isMutualMatch(me, other) {
  const myOffered = (me.skillsOffered || []).map((s) => s.name.toLowerCase());
  const myWanted = (me.skillsWanted || []).map((s) => s.toLowerCase());
  const theirOffered = (other.skillsOffered || []).map((s) => s.name.toLowerCase());
  const theirWanted = (other.skillsWanted || []).map((s) => s.toLowerCase());
  return (
    myOffered.some((s) => theirWanted.includes(s)) &&
    theirOffered.some((s) => myWanted.includes(s))
  );
}

module.exports = { matchScore, isMutualMatch };

function matchScore(me, other) {
  if (!me.skillsOffered?.length && !me.skillsWanted?.length) return 0;
  if (!other.skillsOffered?.length && !other.skillsWanted?.length) return 0;

  const myOffered = me.skillsOffered?.map((s) => s.name.toLowerCase()) || [];
  const myWanted = (me.skillsWanted || []).map((s) => s.toLowerCase());
  const theirOffered = other.skillsOffered?.map((s) => s.name.toLowerCase()) || [];
  const theirWanted = (other.skillsWanted || []).map((s) => s.toLowerCase());

  const iGiveThemWant = myOffered.filter((s) => theirWanted.includes(s)).length;
  const theyGiveMeWant = theirOffered.filter((s) => myWanted.includes(s)).length;
  return iGiveThemWant + theyGiveMeWant;
}

function isMutualMatch(me, other) {
  const myOffered = me.skillsOffered.map((s) => s.name.toLowerCase());
  const myWanted = me.skillsWanted.map((s) => s.toLowerCase());
  const theirOffered = other.skillsOffered.map((s) => s.name.toLowerCase());
  const theirWanted = other.skillsWanted.map((s) => s.toLowerCase());
  return (
    myOffered.some((s) => theirWanted.includes(s)) &&
    theirOffered.some((s) => myWanted.includes(s))
  );
}

module.exports = { matchScore, isMutualMatch };

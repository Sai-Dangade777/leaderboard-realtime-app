export function denseRank(sortedUsers) {
  // sortedUsers: array sorted desc by totalPoints
  let rank = 0;
  let prev = null;
  return sortedUsers.map((u, idx) => {
    if (prev === null || u.totalPoints !== prev) {
      rank += 1;
      prev = u.totalPoints;
    }
    return { ...u, rank };
  });
}

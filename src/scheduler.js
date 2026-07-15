/**
 * Scheduler — pure, framework-free matchmaking logic for Open Play.
 * No React, no app state: given players/courts/history it returns proposed
 * matches. This file is imported by App.jsx and by scheduler.test.js so the
 * exact same logic that runs in the app is what gets unit tested.
 */

  const pairKey = (a, b) => [a, b].sort().join("|");

  function partnerCount(aId, bId, history) {
    let c = 0;
    for (const m of history) {
      if (m.status !== "completed" && m.status !== "no-score") continue;
      if ((m.teamA.includes(aId) && m.teamA.includes(bId)) ||
          (m.teamB.includes(aId) && m.teamB.includes(bId))) c++;
    }
    return c;
  }

  function opponentCount(aId, bId, history) {
    let c = 0;
    for (const m of history) {
      if (m.status !== "completed" && m.status !== "no-score") continue;
      const aInA = m.teamA.includes(aId), aInB = m.teamB.includes(aId);
      const bInA = m.teamA.includes(bId), bInB = m.teamB.includes(bId);
      if ((aInA && bInB) || (aInB && bInA)) c++;
    }
    return c;
  }

  // Sum of pairwise penalties for a proposed teamA/teamB grouping.
  function calculateFairnessScore(teamA, teamB, ctx) {
    const { history, round, avgGames, rankMap, queueLength } = ctx;
    let score = 0;
    score += 100 * partnerCount(teamA[0].id, teamA[1].id, history);
    score += 100 * partnerCount(teamB[0].id, teamB[1].id, history);
    for (const a of teamA) {
      for (const b of teamB) {
        score += 40 * opponentCount(a.id, b.id, history);
      }
    }
    for (const p of [...teamA, ...teamB]) {
      if (p.gamesPlayed > avgGames + 0.001) score += 20;
      // Back-to-back avoidance: heavier penalty for playing the very last round.
      if (p.lastPlayedRound != null && round - p.lastPlayedRound === 0) score += 35;
      else if (p.lastPlayedRound != null && round - p.lastPlayedRound === 1) score += 15;
      const rank = rankMap[p.id] ?? 0;
      const total = Math.max(queueLength, 1);
      score += -40 * (1 - rank / total);
    }
    // Skill balance: keep the two teams' average skill close to each other.
    const skillOf = p => SKILL_VALUE[p.skill] ?? 2.5;
    const teamASkill = (skillOf(teamA[0]) + skillOf(teamA[1])) / 2;
    const teamBSkill = (skillOf(teamB[0]) + skillOf(teamB[1])) / 2;
    score += Math.abs(teamASkill - teamBSkill) * 15;
    return score;
  }

  // Given exactly 4 players, find the pairing (of the 3 possible) with the
  // lowest total penalty.
  function buildTeams(four, ctx) {
    const pairings = [
      [[four[0], four[1]], [four[2], four[3]]],
      [[four[0], four[2]], [four[1], four[3]]],
      [[four[0], four[3]], [four[1], four[2]]],
    ];
    let best = null;
    for (const [teamA, teamB] of pairings) {
      const score = calculateFairnessScore(teamA, teamB, ctx);
      if (!best || score < best.score) best = { teamA, teamB, score };
    }
    return best;
  }

  // Priority order: (1) fewest games played, (2) longest waiting time.
  function getWaitingPlayers(players) {
    return players
      .filter(p => p.status === "waiting" && !p.paused)
      .sort((a, b) => {
        if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed;
        return (a.waitingSince ?? 0) - (b.waitingSince ?? 0);
      });
  }

  const SKILL_VALUE = { Beginner: 1, Intermediate: 2, Advanced: 3, Open: 2.5 };

  function* combinations(arr, k) {
    const n = arr.length;
    const idx = Array.from({ length: k }, (_, i) => i);
    if (k > n) return;
    while (true) {
      yield idx.map(i => arr[i]);
      let i = k - 1;
      while (i >= 0 && idx[i] === i + n - k) i--;
      if (i < 0) return;
      idx[i]++;
      for (let j = i + 1; j < k; j++) idx[j] = idx[j - 1] + 1;
    }
  }

  // emptyCourts: Court[] needing assignment. waitingPool: Player[] already
  // sorted by priority. Returns [{ court, teamA, teamB }]
  function generateMatches(emptyCourts, waitingPool, players, history, round) {
    const checkedIn = players.filter(p => p.status !== "not-checked-in");
    const avgGames = checkedIn.length
      ? checkedIn.reduce((s, p) => s + p.gamesPlayed, 0) / checkedIn.length
      : 0;
    const rankMap = {};
    waitingPool.forEach((p, i) => { rankMap[p.id] = i; });

    let pool = [...waitingPool];
    const results = [];
    for (const court of emptyCourts) {
      if (pool.length < 4) break;
      const candidatePoolSize = Math.min(pool.length, 10);
      const candidates = pool.slice(0, candidatePoolSize);
      let bestGroup = null;
      for (const combo of combinations(candidates, 4)) {
        const ctx = { history, round, avgGames, rankMap, queueLength: waitingPool.length };
        const { teamA, teamB, score } = buildTeams(combo, ctx);
        if (!bestGroup || score < bestGroup.score) bestGroup = { teamA, teamB, score, players: combo };
      }
      results.push({ court, teamA: bestGroup.teamA, teamB: bestGroup.teamB });
      const usedIds = new Set(bestGroup.players.map(p => p.id));
      pool = pool.filter(p => !usedIds.has(p.id));
    }
    return results;
  }

const Scheduler = { pairKey, partnerCount, opponentCount, calculateFairnessScore, buildTeams, getWaitingPlayers, generateMatches };

export { pairKey, partnerCount, opponentCount, calculateFairnessScore, buildTeams, getWaitingPlayers, generateMatches, Scheduler };
export default Scheduler;

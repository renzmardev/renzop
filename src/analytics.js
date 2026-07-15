/**
 * Analytics — pure, framework-free cross-session player statistics.
 * Given the live session state and the archived session list, returns
 * per-player aggregated stats (identity = saved player name, since
 * session-local ids are randomly generated per session).
 */

function formatDuration(ms) {
  if (ms == null || !isFinite(ms) || ms < 0) return "—";
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  return `${h}h ${m}m`;
}

function computePlayerAnalytics(state, archive) {
  const sessionRecords = [
    { id: "__current__", players: state.players, matches: state.history },
    ...archive.map(s => ({ id: s.id, players: s.players, matches: s.matches })),
  ];

  const byKey = new Map();
  function acc(name) {
    const key = name.toLowerCase();
    if (!byKey.has(key)) {
      byKey.set(key, {
        name, matchesPlayed: 0, wins: 0, losses: 0,
        pointsScored: 0, pointsAllowed: 0, scoredMatches: 0,
        totalDurationMs: 0, durationMatches: 0, longestMatchMs: 0,
        courtCounts: {}, sessionIds: new Set(), results: [], waitGaps: [],
      });
    }
    return byKey.get(key);
  }

  for (const rec of sessionRecords) {
    for (const p of rec.players) acc(p.name).sessionIds.add(rec.id);

    const idToName = {};
    rec.players.forEach(p => { idToName[p.id] = p.name; });

    const perPlayerMatches = new Map();
    for (const m of rec.matches) {
      if (m.status !== "completed" && m.status !== "no-score") continue;
      const teamANames = m.teamA.map(id => idToName[id]).filter(Boolean);
      const teamBNames = m.teamB.map(id => idToName[id]).filter(Boolean);
      const duration = (m.endedAt && m.startedAt) ? (m.endedAt - m.startedAt) : null;
      for (const name of [...teamANames, ...teamBNames]) {
        const a = acc(name);
        const isTeamA = teamANames.includes(name);
        a.matchesPlayed++;
        const won = m.winner ? (m.winner === "A" ? isTeamA : !isTeamA) : undefined;
        if (won === true) a.wins++;
        else if (won === false) a.losses++;
        if (m.status === "completed" && m.scoreA != null && m.scoreB != null) {
          a.pointsScored += isTeamA ? m.scoreA : m.scoreB;
          a.pointsAllowed += isTeamA ? m.scoreB : m.scoreA;
          a.scoredMatches++;
        }
        if (duration != null) {
          a.totalDurationMs += duration;
          a.durationMatches++;
          if (duration > a.longestMatchMs) a.longestMatchMs = duration;
        }
        if (m.courtName) a.courtCounts[m.courtName] = (a.courtCounts[m.courtName] || 0) + 1;
        a.results.push({ won, endedAt: m.endedAt || m.startedAt || 0 });
        if (!perPlayerMatches.has(name)) perPlayerMatches.set(name, []);
        perPlayerMatches.get(name).push({ startedAt: m.startedAt, endedAt: m.endedAt });
      }
    }
    // Average waiting time between matches: gaps between consecutive
    // matches for the same player within this session only.
    for (const [name, matches] of perPlayerMatches) {
      const sorted = matches.filter(x => x.startedAt != null).sort((x, y) => x.startedAt - y.startedAt);
      const a = acc(name);
      for (let i = 1; i < sorted.length; i++) {
        const prevEnd = sorted[i - 1].endedAt ?? sorted[i - 1].startedAt;
        const gap = sorted[i].startedAt - prevEnd;
        if (gap >= 0) a.waitGaps.push(gap);
      }
    }
  }

  function streaks(results) {
    const sorted = [...results].sort((x, y) => x.endedAt - y.endedAt);
    let longestWin = 0, run = 0;
    for (const r of sorted) { if (r.won === true) { run++; longestWin = Math.max(longestWin, run); } else run = 0; }
    let currentWin = 0, currentLoss = 0;
    if (sorted.length) {
      const last = sorted[sorted.length - 1];
      if (last.won === true) { for (let i = sorted.length - 1; i >= 0 && sorted[i].won === true; i--) currentWin++; }
      else if (last.won === false) { for (let i = sorted.length - 1; i >= 0 && sorted[i].won === false; i--) currentLoss++; }
    }
    return { currentWin, currentLoss, longestWin };
  }

  return Array.from(byKey.values()).map(a => {
    const { currentWin, currentLoss, longestWin } = streaks(a.results);
    return {
      name: a.name,
      matchesPlayed: a.matchesPlayed,
      wins: a.wins,
      losses: a.losses,
      winPct: a.matchesPlayed ? Math.round((a.wins / a.matchesPlayed) * 100) : 0,
      pointsScored: a.pointsScored,
      pointsAllowed: a.pointsAllowed,
      pointDiff: a.pointsScored - a.pointsAllowed,
      avgPoints: a.scoredMatches ? +(a.pointsScored / a.scoredMatches).toFixed(1) : 0,
      totalDurationMs: a.totalDurationMs,
      avgDurationMs: a.durationMatches ? a.totalDurationMs / a.durationMatches : null,
      longestMatchMs: a.longestMatchMs || null,
      currentWinStreak: currentWin,
      longestWinStreak: longestWin,
      currentLosingStreak: currentLoss,
      sessionsParticipated: a.sessionIds.size,
      avgWaitMs: a.waitGaps.length ? a.waitGaps.reduce((s, x) => s + x, 0) / a.waitGaps.length : null,
      courtCounts: a.courtCounts,
    };
  });
}

export { formatDuration, computePlayerAnalytics };

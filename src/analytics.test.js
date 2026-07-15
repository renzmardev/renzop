// Run with: node --test src/analytics.test.js
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computePlayerAnalytics, formatDuration } from "./analytics.js";

function baseState() {
  return {
    players: [
      { id: "a", name: "Alice" },
      { id: "b", name: "Bob" },
      { id: "c", name: "Carol" },
      { id: "d", name: "Dave" },
    ],
    history: [],
  };
}

describe("computePlayerAnalytics", () => {
  test("aggregates wins, losses, and points from a completed match", () => {
    const state = baseState();
    state.history.push({
      status: "completed", courtName: "Court 1",
      teamA: ["a", "b"], teamB: ["c", "d"],
      scoreA: 11, scoreB: 7, winner: "A",
      startedAt: 0, endedAt: 10 * 60000,
    });
    const [alice, bob, carol, dave] = ["Alice", "Bob", "Carol", "Dave"]
      .map(name => computePlayerAnalytics(state, []).find(p => p.name === name));

    assert.equal(alice.wins, 1);
    assert.equal(alice.losses, 0);
    assert.equal(alice.pointsScored, 11);
    assert.equal(alice.pointsAllowed, 7);
    assert.equal(alice.pointDiff, 4);
    assert.equal(carol.wins, 0);
    assert.equal(carol.losses, 1);
    assert.equal(carol.pointsScored, 7);
  });

  test("a no-score match still counts as played and can record a winner, with no points", () => {
    const state = baseState();
    state.history.push({
      status: "no-score", courtName: "Court 2",
      teamA: ["a", "b"], teamB: ["c", "d"],
      winner: "B",
      startedAt: 0, endedAt: 5 * 60000,
    });
    const result = computePlayerAnalytics(state, []);
    const alice = result.find(p => p.name === "Alice");
    const carol = result.find(p => p.name === "Carol");
    assert.equal(alice.matchesPlayed, 1);
    assert.equal(alice.losses, 1);
    assert.equal(alice.pointsScored, 0);
    assert.equal(alice.avgPoints, 0); // no scores recorded, so points-per-match stays 0
    assert.equal(carol.wins, 1);
  });

  test("a no-score match with no winner selected affects neither wins nor losses", () => {
    const state = baseState();
    state.history.push({
      status: "no-score", courtName: "Court 2",
      teamA: ["a", "b"], teamB: ["c", "d"],
      startedAt: 0, endedAt: 5 * 60000,
    });
    const result = computePlayerAnalytics(state, []);
    for (const p of result) {
      assert.equal(p.wins, 0);
      assert.equal(p.losses, 0);
      assert.equal(p.matchesPlayed, 1);
    }
  });

  test("computes current and longest win streaks in chronological order", () => {
    const state = baseState();
    state.history.push(
      { status: "no-score", courtName: "C1", teamA: ["a", "b"], teamB: ["c", "d"], winner: "A", startedAt: 0, endedAt: 100 },
      { status: "no-score", courtName: "C1", teamA: ["a", "b"], teamB: ["c", "d"], winner: "A", startedAt: 200, endedAt: 300 },
      { status: "no-score", courtName: "C1", teamA: ["a", "b"], teamB: ["c", "d"], winner: "B", startedAt: 400, endedAt: 500 },
    );
    const alice = computePlayerAnalytics(state, []).find(p => p.name === "Alice");
    assert.equal(alice.longestWinStreak, 2);
    assert.equal(alice.currentWinStreak, 0); // most recent match was a loss
    assert.equal(alice.currentLosingStreak, 1);
  });

  test("aggregates the same player by name across the live session and archived sessions", () => {
    const state = baseState();
    state.history.push({
      status: "completed", courtName: "Court 1", teamA: ["a", "b"], teamB: ["c", "d"],
      scoreA: 11, scoreB: 9, winner: "A", startedAt: 1000, endedAt: 1000 + 60000,
    });
    const archive = [{
      id: "s1", endedAt: 500,
      players: [{ id: "x", name: "Alice" }, { id: "y", name: "Bob" }, { id: "z", name: "Carol" }, { id: "w", name: "Dave" }],
      matches: [{
        status: "completed", courtName: "Court 3", teamA: ["x", "y"], teamB: ["z", "w"],
        scoreA: 5, scoreB: 11, winner: "B", startedAt: 0, endedAt: 60000,
      }],
    }];
    const alice = computePlayerAnalytics(state, archive).find(p => p.name === "Alice");
    assert.equal(alice.matchesPlayed, 2);
    assert.equal(alice.sessionsParticipated, 2);
    assert.equal(alice.pointsScored, 16); // 11 + 5
  });

  test("every registered player appears even with zero matches played", () => {
    const state = baseState(); // no history at all
    const result = computePlayerAnalytics(state, []);
    assert.equal(result.length, 4);
    for (const p of result) {
      assert.equal(p.matchesPlayed, 0);
      assert.equal(p.winPct, 0);
    }
  });
});

describe("formatDuration", () => {
  test("formats sub-hour durations as minutes", () => {
    assert.equal(formatDuration(15 * 60000), "15 min");
  });
  test("formats durations over an hour as h/m", () => {
    assert.equal(formatDuration(90 * 60000), "1h 30m");
  });
  test("returns an em dash for null/invalid input", () => {
    assert.equal(formatDuration(null), "—");
    assert.equal(formatDuration(undefined), "—");
    assert.equal(formatDuration(-5), "—");
  });
});

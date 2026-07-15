// Run with: node --test src/scheduler.test.js
// (no extra dependencies needed — uses Node's built-in test runner)
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { Scheduler } from "./scheduler.js";

function makePlayers(n) {
  const players = [];
  for (let i = 0; i < n; i++) {
    players.push({
      id: "p" + i,
      name: "Player " + i,
      skill: "Open",
      status: "waiting",
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      waitingSince: i, // stable, deterministic ordering
      paused: false,
    });
  }
  return players;
}

function makeCourts(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: "c" + (i + 1),
    name: "Court " + (i + 1),
    enabled: true,
  }));
}

describe("Scheduler.generateMatches — court count coverage", () => {
  // This is the regression test for the "players not assigned to Court 4+"
  // report: every enabled empty court should get a match whenever there
  // are enough waiting players, regardless of how many courts there are.
  for (const courtCount of [1, 2, 3, 4, 5, 6, 8, 10]) {
    test(`fills all ${courtCount} court(s) when exactly enough players are waiting`, () => {
      const courts = makeCourts(courtCount);
      const players = makePlayers(courtCount * 4);
      const waiting = Scheduler.getWaitingPlayers(players);
      const groups = Scheduler.generateMatches(courts, waiting, players, [], 1);

      assert.equal(groups.length, courtCount, `expected all ${courtCount} courts to receive a match`);

      // Every court appears exactly once, and every player appears exactly once.
      const seenCourts = new Set(groups.map(g => g.court.id));
      assert.equal(seenCourts.size, courtCount);

      const seenPlayers = new Set();
      for (const g of groups) {
        for (const p of [...g.teamA, ...g.teamB]) {
          assert.ok(!seenPlayers.has(p.id), `player ${p.id} assigned to more than one match`);
          seenPlayers.add(p.id);
        }
      }
      assert.equal(seenPlayers.size, courtCount * 4);
    });
  }

  test("fills as many courts as possible when players are short, and stops cleanly", () => {
    const courts = makeCourts(5);
    const players = makePlayers(18); // 4 full courts + 2 players left over
    const waiting = Scheduler.getWaitingPlayers(players);
    const groups = Scheduler.generateMatches(courts, waiting, players, [], 1);
    assert.equal(groups.length, 4);
  });

  test("returns no groups when fewer than 4 players are waiting", () => {
    const courts = makeCourts(3);
    const players = makePlayers(3);
    const waiting = Scheduler.getWaitingPlayers(players);
    const groups = Scheduler.generateMatches(courts, waiting, players, [], 1);
    assert.equal(groups.length, 0);
  });

  test("adding a court mid-session still gets filled (large court counts)", () => {
    // Regression guard: courts beyond the first few should not be silently skipped.
    const courts = makeCourts(12);
    const players = makePlayers(48);
    const waiting = Scheduler.getWaitingPlayers(players);
    const groups = Scheduler.generateMatches(courts, waiting, players, [], 1);
    assert.equal(groups.length, 12);
    const lastCourtFilled = groups.some(g => g.court.id === "c12");
    assert.ok(lastCourtFilled, "Court 12 should have received a match");
  });
});

describe("Scheduler fairness", () => {
  test("avoids repeating the same teammate pair when alternatives exist", () => {
    const courts = makeCourts(1);
    const players = makePlayers(8);
    const history = [
      { status: "completed", teamA: ["p0", "p1"], teamB: ["p2", "p3"] },
    ];
    const waiting = Scheduler.getWaitingPlayers(players);
    const groups = Scheduler.generateMatches(courts, waiting, players, history, 2);
    const group = groups[0];
    const teamAIds = group.teamA.map(p => p.id).sort();
    assert.notDeepEqual(teamAIds, ["p0", "p1"], "p0/p1 should not be re-paired as teammates immediately");
  });

  test("prioritizes players with fewer games played", () => {
    const courts = makeCourts(1);
    const players = makePlayers(6).map((p, i) => ({ ...p, gamesPlayed: i < 4 ? 5 : 0, waitingSince: 0 }));
    const waiting = Scheduler.getWaitingPlayers(players);
    // The two players with 0 games should come first in priority order.
    assert.equal(waiting[0].gamesPlayed, 0);
    assert.equal(waiting[1].gamesPlayed, 0);
  });
});

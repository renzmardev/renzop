import React, { useEffect, useMemo, useReducer, useRef, useState, createContext, useContext } from "react";
import {
  Users, UserCheck, Clock, LayoutGrid, Trophy, RotateCw, Settings, Moon, Sun,
  Plus, Search, Check, X, Pencil, Trash2, ChevronUp, ChevronDown, Pause, Play,
  Shuffle, History as HistoryIcon, BarChart3, Save, FolderOpen, LogOut, LogIn,
  CircleDot, ChevronRight, AlertCircle, Timer
} from "lucide-react";

/* ============================================================================
   MASTERS/BESTIES OPEN PLAY — PICKLEBALL MATCH MANAGER
   Design language: "the scoreboard court" — a deep court-blue and optic-yellow
   palette, condensed scoreboard numerals for rounds/scores, and match cards
   drawn as literal courts (net line down the middle, kitchen zones shaded)
   so the UI reads as pickleball, not a generic admin panel.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   FONTS
--------------------------------------------------------------------------- */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Teko:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    .op-root { font-family: 'Inter', system-ui, sans-serif; }
    .op-score { font-family: 'Teko', sans-serif; letter-spacing: 0.01em; }
  `}</style>
);

/* ---------------------------------------------------------------------------
   SCHEDULER MODULE — pure functions, independent of UI / React.
   Exposed: pairKey, partnerCount, opponentCount, calculateFairnessScore,
   buildTeams, getWaitingPlayers, generateMatches
--------------------------------------------------------------------------- */
const Scheduler = (() => {
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
      if (p.lastPlayedRound != null && round - p.lastPlayedRound <= 1) score += 25;
      const rank = rankMap[p.id] ?? 0;
      const total = Math.max(queueLength, 1);
      score += -40 * (1 - rank / total);
    }
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

  function getWaitingPlayers(players) {
    return players
      .filter(p => p.status === "waiting" && !p.paused)
      .sort((a, b) => {
        if (a.waitingSince !== b.waitingSince) return (a.waitingSince ?? 0) - (b.waitingSince ?? 0);
        return a.gamesPlayed - b.gamesPlayed;
      });
  }

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

  return {
    pairKey, partnerCount, opponentCount, calculateFairnessScore,
    buildTeams, getWaitingPlayers, generateMatches,
  };
})();

/* ---------------------------------------------------------------------------
   TYPES (documented via JSDoc since this runtime executes plain JS/JSX)
   Player: { id, name, gender?, skill, status, gamesPlayed, wins, losses,
             checkInTime?, waitingSince?, paused?, courtId?, lastPlayedRound? }
   Court:  { id, name, enabled }
   Match:  { id, courtId, courtName, round, teamA:[id,id], teamB:[id,id],
             status: 'active'|'completed'|'no-score'|'cancelled',
             scoreA?, scoreB?, winner?, startedAt, endedAt? }
--------------------------------------------------------------------------- */

const uid = () => Math.random().toString(36).slice(2, 10);
const SKILLS = ["Beginner", "Intermediate", "Advanced", "Open"];

function makeInitialCourts() {
  return [1, 2, 3, 4].map(n => ({ id: uid(), name: `Court ${n}`, enabled: true }));
}

const initialState = {
  sessionName: "Friday open play",
  players: [],
  courts: makeInitialCourts(),
  matches: [],
  history: [],
  round: 1,
  darkMode: false,
};

/* ---------------------------------------------------------------------------
   REDUCER / STORE
--------------------------------------------------------------------------- */
function reducer(state, action) {
  switch (action.type) {
    case "LOAD_STATE":
      return { ...initialState, ...action.payload };

    case "RESET_SESSION":
      return { ...initialState, courts: makeInitialCourts(), sessionName: action.name || "New session" };

    case "SET_SESSION_NAME":
      return { ...state, sessionName: action.name };

    case "TOGGLE_DARK":
      return { ...state, darkMode: !state.darkMode };

    /* ---------------- players ---------------- */
    case "ADD_PLAYER": {
      const p = {
        id: uid(), name: action.name.trim(), gender: action.gender || "",
        skill: action.skill || "Open", status: "not-checked-in",
        gamesPlayed: 0, wins: 0, losses: 0,
      };
      return { ...state, players: [...state.players, p] };
    }
    case "BULK_ADD_PLAYERS": {
      const names = action.names;
      const newPlayers = names.map(n => ({
        id: uid(), name: n.trim(), gender: "", skill: "Open", status: "not-checked-in",
        gamesPlayed: 0, wins: 0, losses: 0,
      }));
      return { ...state, players: [...state.players, ...newPlayers] };
    }
    case "UPDATE_PLAYER": {
      return { ...state, players: state.players.map(p => p.id === action.id ? { ...p, ...action.patch } : p) };
    }
    case "REMOVE_PLAYER": {
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.id),
        matches: state.matches.filter(m => !m.teamA.includes(action.id) && !m.teamB.includes(action.id)),
      };
    }
    case "CHECK_IN": {
      return { ...state, players: state.players.map(p => p.id === action.id
        ? { ...p, status: "waiting", checkInTime: Date.now(), waitingSince: Date.now() } : p) };
    }
    case "CHECK_OUT": {
      return {
        ...state,
        players: state.players.map(p => p.id === action.id
          ? { ...p, status: "not-checked-in", checkInTime: null, waitingSince: null, courtId: null } : p),
      };
    }
    case "PAUSE_PLAYER": {
      return { ...state, players: state.players.map(p => p.id === action.id ? { ...p, paused: !p.paused } : p) };
    }
    case "MOVE_QUEUE": {
      const waiting = Scheduler.getWaitingPlayers(state.players);
      const idx = waiting.findIndex(p => p.id === action.id);
      if (idx === -1) return state;
      const swapIdx = action.dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= waiting.length) return state;
      const a = waiting[idx], b = waiting[swapIdx];
      const now = Date.now();
      // swap waitingSince to reorder priority
      const wa = a.waitingSince ?? now, wb = b.waitingSince ?? now;
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id === a.id) return { ...p, waitingSince: wb };
          if (p.id === b.id) return { ...p, waitingSince: wa };
          return p;
        }),
      };
    }

    /* ---------------- courts ---------------- */
    case "ADD_COURT": {
      return { ...state, courts: [...state.courts, { id: uid(), name: action.name, enabled: true }] };
    }
    case "UPDATE_COURT": {
      return { ...state, courts: state.courts.map(c => c.id === action.id ? { ...c, ...action.patch } : c) };
    }
    case "REMOVE_COURT": {
      return { ...state, courts: state.courts.filter(c => c.id !== action.id) };
    }

    /* ---------------- matches ---------------- */
    case "GENERATE_MATCHES": {
      const busyCourtIds = new Set(state.matches.map(m => m.courtId));
      const emptyCourts = state.courts.filter(c => c.enabled && !busyCourtIds.has(c.id));
      if (emptyCourts.length === 0) return state;
      const waiting = Scheduler.getWaitingPlayers(state.players);
      const groups = Scheduler.generateMatches(emptyCourts, waiting, state.players, state.history, state.round);
      if (groups.length === 0) return state;
      const now = Date.now();
      const newMatches = groups.map(g => ({
        id: uid(), courtId: g.court.id, courtName: g.court.name, round: state.round,
        teamA: [g.teamA[0].id, g.teamA[1].id], teamB: [g.teamB[0].id, g.teamB[1].id],
        status: "active", startedAt: now,
      }));
      const assignedIds = new Set(newMatches.flatMap(m => [...m.teamA, ...m.teamB]));
      return {
        ...state,
        matches: [...state.matches, ...newMatches],
        players: state.players.map(p => assignedIds.has(p.id)
          ? { ...p, status: "playing", courtId: newMatches.find(m => m.teamA.includes(p.id) || m.teamB.includes(p.id)).courtId }
          : p),
      };
    }

    case "CANCEL_MATCH": {
      const m = state.matches.find(x => x.id === action.id);
      if (!m) return state;
      const ids = new Set([...m.teamA, ...m.teamB]);
      return {
        ...state,
        matches: state.matches.filter(x => x.id !== action.id),
        players: state.players.map(p => ids.has(p.id)
          ? { ...p, status: "waiting", waitingSince: Date.now(), courtId: null } : p),
      };
    }

    case "FINISH_MATCH": {
      const m = state.matches.find(x => x.id === action.id);
      if (!m) return state;
      const now = Date.now();
      let winner;
      if (action.mode === "score") {
        winner = action.scoreA > action.scoreB ? "A" : action.scoreB > action.scoreA ? "B" : undefined;
      }
      const finished = {
        ...m, status: action.mode === "score" ? "completed" : "no-score",
        scoreA: action.mode === "score" ? action.scoreA : undefined,
        scoreB: action.mode === "score" ? action.scoreB : undefined,
        winner, endedAt: now,
      };
      const ids = new Set([...m.teamA, ...m.teamB]);
      let players = state.players.map(p => {
        if (!ids.has(p.id)) return p;
        const won = winner === "A" ? m.teamA.includes(p.id) : winner === "B" ? m.teamB.includes(p.id) : undefined;
        return {
          ...p,
          status: "waiting",
          waitingSince: now,
          courtId: null,
          gamesPlayed: p.gamesPlayed + 1,
          wins: p.wins + (won === true ? 1 : 0),
          losses: p.losses + (won === false ? 1 : 0),
          lastPlayedRound: m.round,
        };
      });

      let remainingMatches = state.matches.filter(x => x.id !== action.id);
      let round = state.round;
      const stillActiveThisRound = remainingMatches.some(x => x.round === round);
      if (!stillActiveThisRound) round = round + 1;

      let history = [...state.history, finished];

      // Auto-rotate: fill freed court (and any other empty enabled courts)
      const busyCourtIds = new Set(remainingMatches.map(x => x.courtId));
      const emptyCourts = state.courts.filter(c => c.enabled && !busyCourtIds.has(c.id));
      let newMatches = [];
      if (emptyCourts.length > 0) {
        const waiting = Scheduler.getWaitingPlayers(players);
        const groups = Scheduler.generateMatches(emptyCourts, waiting, players, history, round);
        newMatches = groups.map(g => ({
          id: uid(), courtId: g.court.id, courtName: g.court.name, round,
          teamA: [g.teamA[0].id, g.teamA[1].id], teamB: [g.teamB[0].id, g.teamB[1].id],
          status: "active", startedAt: now,
        }));
        const assignedIds = new Set(newMatches.flatMap(nm => [...nm.teamA, ...nm.teamB]));
        players = players.map(p => assignedIds.has(p.id)
          ? { ...p, status: "playing", courtId: newMatches.find(nm => nm.teamA.includes(p.id) || nm.teamB.includes(p.id)).courtId }
          : p);
      }

      return { ...state, players, matches: [...remainingMatches, ...newMatches], history, round };
    }

    case "SHUFFLE_ROUND": {
      // Cancel all active matches (no stats) then regenerate.
      const activeIds = new Set(state.matches.flatMap(m => [...m.teamA, ...m.teamB]));
      const players = state.players.map(p => activeIds.has(p.id)
        ? { ...p, status: "waiting", waitingSince: Date.now(), courtId: null } : p);
      return { ...state, players, matches: [] };
    }

    default:
      return state;
  }
}

const StoreCtx = createContext(null);
function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

const STORAGE_KEY = "openplay:session";

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "LOAD_STATE", payload: JSON.parse(raw) });
    } catch (e) {
      // no saved session yet
    } finally {
      loaded.current = true;
    }
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }, 400);
    return () => clearTimeout(t);
  }, [state]);

  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>;
}

/* ---------------------------------------------------------------------------
   THEME HELPERS
--------------------------------------------------------------------------- */
function useTheme() {
  const { state } = useStore();
  const dark = state.darkMode;
  return {
    dark,
    page: dark ? "bg-[#0B1E29] text-[#EFF3EE]" : "bg-[#F5F7F2] text-[#0F2B3D]",
    panel: dark ? "bg-[#122F40] border border-[#1F4A61]" : "bg-white border border-[#DCE3D8]",
    panelSoft: dark ? "bg-[#0F2734] border border-[#1F4A61]" : "bg-[#EFF3EA] border border-[#DCE3D8]",
    subtext: dark ? "text-[#9FC3D1]" : "text-[#4C6270]",
    border: dark ? "border-[#1F4A61]" : "border-[#DCE3D8]",
    hover: dark ? "hover:bg-[#1A4053]" : "hover:bg-[#EAF0E4]",
  };
}

const YELLOW = "#D9F14A";
const YELLOW_DK = "#5C6B12";
const CORAL = "#FF6B4A";
const GREEN = "#35C48D";
const BLUE = "#3B8FD6";

const statusColor = {
  "not-checked-in": { dot: "#9AA5A0", bg: "bg-gray-400/15", text: "text-gray-400" },
  "waiting": { dot: "#F5A623", bg: "bg-orange-400/15", text: "text-orange-500" },
  "playing": { dot: BLUE, bg: "bg-blue-400/15", text: "text-blue-500" },
};

/* ---------------------------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------------------------- */
function Btn({ children, onClick, variant = "default", className = "", disabled, title, type = "button" }) {
  const t = useTheme();
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed select-none";
  const variants = {
    default: `${t.panel} ${t.hover}`,
    primary: "bg-[#0F2B3D] text-[#D9F14A] hover:bg-[#163A50] border border-[#0F2B3D]",
    yellow: "bg-[#D9F14A] text-[#1F2B08] hover:brightness-95 border border-[#D9F14A] font-semibold",
    danger: "bg-[#FF6B4A]/10 text-[#FF6B4A] border border-[#FF6B4A]/40 hover:bg-[#FF6B4A]/20",
    ghost: `hover:${t.dark ? "bg-white/5" : "bg-black/5"} border border-transparent`,
  };
  return (
    <button type={type} title={title} disabled={disabled} onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-400/15 text-gray-500",
    green: "bg-[#35C48D]/15 text-[#1E8A61]",
    orange: "bg-orange-400/15 text-orange-500",
    blue: "bg-[#3B8FD6]/15 text-[#2570A8]",
    yellow: "bg-[#D9F14A]/25 text-[#5C6B12]",
    coral: "bg-[#FF6B4A]/15 text-[#C94D2F]",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function Panel({ children, className = "" }) {
  const t = useTheme();
  return <div className={`rounded-2xl ${t.panel} p-4 ${className}`}>{children}</div>;
}

function Field({ label, children }) {
  const t = useTheme();
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className={`text-xs font-medium ${t.subtext}`}>{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  const t = useTheme();
  return <input {...props} className={`rounded-lg px-3 py-2 text-sm outline-none ${t.panelSoft} focus:ring-2 focus:ring-[#D9F14A]/60 ${props.className || ""}`} />;
}
function Select(props) {
  const t = useTheme();
  return <select {...props} className={`rounded-lg px-3 py-2 text-sm outline-none ${t.panelSoft} ${props.className || ""}`}>{props.children}</select>;
}

function playerName(players, id) {
  const p = players.find(p => p.id === id);
  return p ? p.name : "—";
}

/* ---------------------------------------------------------------------------
   DASHBOARD
--------------------------------------------------------------------------- */
function StatCard({ icon: Icon, label, value, accent }) {
  const t = useTheme();
  return (
    <Panel className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accent ? `${YELLOW}33` : t.dark ? "#1A4053" : "#EAF0E4" }}>
        <Icon size={18} color={accent ? YELLOW_DK : (t.dark ? "#D9F14A" : "#0F2B3D")} />
      </div>
      <div>
        <div className="op-score text-3xl leading-none">{value}</div>
        <div className={`text-xs mt-0.5 ${t.subtext}`}>{label}</div>
      </div>
    </Panel>
  );
}

function Dashboard() {
  const { state, dispatch } = useStore();
  const t = useTheme();
  const total = state.players.length;
  const checkedIn = state.players.filter(p => p.status !== "not-checked-in").length;
  const waiting = state.players.filter(p => p.status === "waiting").length;
  const activeMatches = state.matches.length;
  const availableCourts = state.courts.filter(c => c.enabled).length;
  const emptyCourts = state.courts.filter(c => c.enabled && !state.matches.some(m => m.courtId === c.id));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Users} label="Registered players" value={total} />
        <StatCard icon={UserCheck} label="Checked in" value={checkedIn} />
        <StatCard icon={Clock} label="Waiting" value={waiting} />
        <StatCard icon={Trophy} label="Active matches" value={activeMatches} accent />
        <StatCard icon={LayoutGrid} label="Available courts" value={availableCourts} />
        <StatCard icon={CircleDot} label="Round" value={state.round} accent />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Live courts</h2>
        {emptyCourts.length > 0 && Scheduler.getWaitingPlayers(state.players).length >= 4 && (
          <Btn variant="yellow" onClick={() => dispatch({ type: "GENERATE_MATCHES" })}>
            <Plus size={16} /> Fill {emptyCourts.length} open court{emptyCourts.length > 1 ? "s" : ""}
          </Btn>
        )}
      </div>
      <CourtGrid />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   COURT / MATCH CARD  — the signature visual: a literal court with a net
--------------------------------------------------------------------------- */
function TeamSlot({ players, ids, side }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      {ids.map(id => (
        <div key={id} className="truncate text-sm font-medium">{playerName(players, id)}</div>
      ))}
    </div>
  );
}

function MatchCard({ match, court }) {
  const { state, dispatch } = useStore();
  const t = useTheme();
  const [scoreOpen, setScoreOpen] = useState(false);
  const [scoreA, setScoreA] = useState("11");
  const [scoreB, setScoreB] = useState("7");
  const elapsed = useElapsed(match?.startedAt);

  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: match ? BLUE : "#9AA5A0" }} />
          <span className="font-semibold text-sm">{court.name}</span>
        </div>
        {match && (
          <span className={`text-xs op-score text-base ${t.subtext}`}><Timer size={12} className="inline -mt-0.5 mr-1" />{elapsed}</span>
        )}
      </div>

      {match ? (
        <>
          <div className="relative rounded-xl overflow-hidden" style={{ background: t.dark ? "#0C2634" : "#123B52" }}>
            <div className="flex">
              <div className="flex-1 p-3 relative">
                <div className="absolute top-0 left-0 right-0 h-2" style={{ background: t.dark ? "#0E2E3E" : "#0F324600" }} />
                <TeamSlotColored ids={match.teamA} players={state.players} />
              </div>
              <div className="w-[3px] shrink-0" style={{ background: YELLOW }} />
              <div className="flex-1 p-3">
                <TeamSlotColored ids={match.teamB} players={state.players} align="right" />
              </div>
            </div>
          </div>

          {!scoreOpen ? (
            <div className="flex gap-2">
              <Btn variant="yellow" className="flex-1" onClick={() => setScoreOpen(true)}>
                <Check size={15} /> Finish match
              </Btn>
              <Btn variant="danger" onClick={() => dispatch({ type: "CANCEL_MATCH", id: match.id })} title="Cancel match">
                <X size={15} />
              </Btn>
            </div>
          ) : (
            <div className={`flex flex-col gap-2 rounded-lg p-2 ${t.panelSoft}`}>
              <div className="flex items-center gap-2">
                <TextInput type="number" value={scoreA} onChange={e => setScoreA(e.target.value)} className="w-16" />
                <span className={`text-xs ${t.subtext}`}>vs</span>
                <TextInput type="number" value={scoreB} onChange={e => setScoreB(e.target.value)} className="w-16" />
                <Btn variant="primary" className="flex-1" onClick={() => {
                  dispatch({ type: "FINISH_MATCH", id: match.id, mode: "score", scoreA: Number(scoreA), scoreB: Number(scoreB) });
                  setScoreOpen(false);
                }}>Save score</Btn>
              </div>
              <div className="flex gap-2">
                <Btn className="flex-1" onClick={() => { dispatch({ type: "FINISH_MATCH", id: match.id, mode: "no-score" }); setScoreOpen(false); }}>
                  End without score
                </Btn>
                <Btn variant="ghost" onClick={() => setScoreOpen(false)}>Back</Btn>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={`rounded-xl border border-dashed ${t.border} py-8 flex items-center justify-center text-sm ${t.subtext}`}>
          Court open
        </div>
      )}
    </Panel>
  );
}

function TeamSlotColored({ ids, players, align }) {
  return (
    <div className={`flex flex-col gap-1 ${align === "right" ? "items-end text-right" : ""}`}>
      {ids.map(id => (
        <div key={id} className="truncate text-sm font-semibold" style={{ color: "#EFF7DE" }}>{playerName(players, id)}</div>
      ))}
    </div>
  );
}

function useElapsed(startedAt) {
  const [, force] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => force(x => x + 1), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  if (!startedAt) return "";
  const s = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function CourtGrid() {
  const { state } = useStore();
  const byCourtId = useMemo(() => {
    const map = {};
    state.matches.forEach(m => { map[m.courtId] = m; });
    return map;
  }, [state.matches]);
  const courts = state.courts.filter(c => c.enabled);
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {courts.map(c => <MatchCard key={c.id} court={c} match={byCourtId[c.id]} />)}
      {courts.length === 0 && <div className="text-sm opacity-60">No courts enabled. Add one from the Courts tab.</div>}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   PLAYERS
--------------------------------------------------------------------------- */
function PlayersPage() {
  const { state, dispatch } = useStore();
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = state.players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="relative">
          <Search size={15} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${t.subtext}`} />
          <TextInput placeholder="Search players" value={query} onChange={e => setQuery(e.target.value)} className="pl-8 w-56" />
        </div>
        <div className="flex gap-2">
          <Btn onClick={() => setShowBulk(true)}><Plus size={15} /> Bulk import</Btn>
          <Btn variant="yellow" onClick={() => setShowAdd(true)}><Plus size={15} /> Add player</Btn>
        </div>
      </div>

      {showAdd && <AddPlayerForm onClose={() => setShowAdd(false)} />}
      {showBulk && <BulkImportForm onClose={() => setShowBulk(false)} />}
      {editing && <AddPlayerForm player={editing} onClose={() => setEditing(null)} />}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(p => <PlayerCard key={p.id} player={p} onEdit={() => setEditing(p)} />)}
        {filtered.length === 0 && <div className={`text-sm ${t.subtext}`}>No players yet. Add one to get started.</div>}
      </div>
    </div>
  );
}

function PlayerCard({ player: p, onEdit }) {
  const { dispatch } = useStore();
  const t = useTheme();
  const sc = statusColor[p.status] || statusColor["not-checked-in"];
  const label = p.status === "playing" ? "Playing" : p.status === "waiting" ? "Waiting" : "Not checked in";
  return (
    <Panel className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{p.name}</div>
          <div className={`text-xs ${t.subtext}`}>{p.skill}{p.gender ? ` · ${p.gender}` : ""}</div>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${sc.text}`}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: sc.dot }} />{label}
        </span>
      </div>
      <div className={`flex gap-3 text-xs ${t.subtext}`}>
        <span>GP {p.gamesPlayed}</span><span>W {p.wins}</span><span>L {p.losses}</span>
      </div>
      <div className="flex gap-2 pt-1">
        {p.status === "not-checked-in" ? (
          <Btn variant="yellow" className="flex-1" onClick={() => dispatch({ type: "CHECK_IN", id: p.id })}><LogIn size={14} /> Check in</Btn>
        ) : (
          <Btn className="flex-1" disabled={p.status === "playing"} onClick={() => dispatch({ type: "CHECK_OUT", id: p.id })}>
            <LogOut size={14} /> Check out
          </Btn>
        )}
        <Btn variant="ghost" onClick={onEdit} title="Edit"><Pencil size={14} /></Btn>
        <Btn variant="ghost" onClick={() => dispatch({ type: "REMOVE_PLAYER", id: p.id })} title="Remove"><Trash2 size={14} /></Btn>
      </div>
    </Panel>
  );
}

function AddPlayerForm({ onClose, player }) {
  const { dispatch } = useStore();
  const [name, setName] = useState(player?.name || "");
  const [gender, setGender] = useState(player?.gender || "");
  const [skill, setSkill] = useState(player?.skill || "Open");
  return (
    <Panel className="flex flex-wrap items-end gap-3">
      <Field label="Name"><TextInput value={name} onChange={e => setName(e.target.value)} placeholder="Player name" /></Field>
      <Field label="Gender (optional)">
        <Select value={gender} onChange={e => setGender(e.target.value)}>
          <option value="">—</option><option>Female</option><option>Male</option><option>Other</option>
        </Select>
      </Field>
      <Field label="Skill level">
        <Select value={skill} onChange={e => setSkill(e.target.value)}>
          {SKILLS.map(s => <option key={s}>{s}</option>)}
        </Select>
      </Field>
      <Btn variant="yellow" onClick={() => {
        if (!name.trim()) return;
        if (player) dispatch({ type: "UPDATE_PLAYER", id: player.id, patch: { name: name.trim(), gender, skill } });
        else dispatch({ type: "ADD_PLAYER", name, gender, skill });
        onClose();
      }}>{player ? "Save changes" : "Add player"}</Btn>
      <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
    </Panel>
  );
}

function BulkImportForm({ onClose }) {
  const { dispatch } = useStore();
  const [text, setText] = useState("");
  const t = useTheme();
  return (
    <Panel className="flex flex-col gap-2">
      <Field label="Paste one player name per line">
        <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
          className={`rounded-lg px-3 py-2 text-sm outline-none ${t.panelSoft}`} placeholder={"Alex Chen\nJamie Rivera\nSam Osei"} />
      </Field>
      <div className="flex gap-2">
        <Btn variant="yellow" onClick={() => {
          const names = text.split("\n").map(s => s.trim()).filter(Boolean);
          if (names.length) dispatch({ type: "BULK_ADD_PLAYERS", names });
          onClose();
        }}>Import players</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   COURTS
--------------------------------------------------------------------------- */
function CourtsPage() {
  const { state, dispatch } = useStore();
  const t = useTheme();
  const [name, setName] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex items-end gap-3">
        <Field label="New court name">
          <TextInput value={name} onChange={e => setName(e.target.value)} placeholder={`Court ${state.courts.length + 1}`} />
        </Field>
        <Btn variant="yellow" onClick={() => {
          dispatch({ type: "ADD_COURT", name: name.trim() || `Court ${state.courts.length + 1}` });
          setName("");
        }}><Plus size={15} /> Add court</Btn>
      </Panel>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {state.courts.map(c => (
          <Panel key={c.id} className="flex items-center justify-between gap-2">
            <TextInput value={c.name} onChange={e => dispatch({ type: "UPDATE_COURT", id: c.id, patch: { name: e.target.value } })} />
            <div className="flex items-center gap-1 shrink-0">
              <Btn variant={c.enabled ? "yellow" : "default"} onClick={() => dispatch({ type: "UPDATE_COURT", id: c.id, patch: { enabled: !c.enabled } })}>
                {c.enabled ? "Enabled" : "Disabled"}
              </Btn>
              <Btn variant="ghost" onClick={() => dispatch({ type: "REMOVE_COURT", id: c.id })}><Trash2 size={14} /></Btn>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   QUEUE
--------------------------------------------------------------------------- */
function QueuePage() {
  const { state, dispatch } = useStore();
  const t = useTheme();
  const waiting = state.players.filter(p => p.status === "waiting").sort((a, b) => {
    if (!!a.paused !== !!b.paused) return a.paused ? 1 : -1;
    return (a.waitingSince ?? 0) - (b.waitingSince ?? 0);
  });
  return (
    <div className="flex flex-col gap-2">
      {waiting.length === 0 && <div className={`text-sm ${t.subtext}`}>No one is waiting right now.</div>}
      {waiting.map((p, i) => (
        <Panel key={p.id} className="flex items-center gap-3">
          <div className="op-score text-2xl w-8 text-center" style={{ color: p.paused ? "#9AA5A0" : YELLOW_DK }}>{i + 1}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{p.name} {p.paused && <span className={`text-xs font-normal ${t.subtext}`}>(paused)</span>}</div>
            <div className={`text-xs ${t.subtext}`}>GP {p.gamesPlayed} · waiting {formatWait(p.waitingSince)}</div>
          </div>
          <div className="flex items-center gap-1">
            <Btn variant="ghost" onClick={() => dispatch({ type: "MOVE_QUEUE", id: p.id, dir: "up" })}><ChevronUp size={14} /></Btn>
            <Btn variant="ghost" onClick={() => dispatch({ type: "MOVE_QUEUE", id: p.id, dir: "down" })}><ChevronDown size={14} /></Btn>
            <Btn variant="ghost" onClick={() => dispatch({ type: "PAUSE_PLAYER", id: p.id })} title={p.paused ? "Resume" : "Pause"}>
              {p.paused ? <Play size={14} /> : <Pause size={14} />}
            </Btn>
            <Btn variant="ghost" onClick={() => dispatch({ type: "CHECK_OUT", id: p.id })} title="Remove from queue"><X size={14} /></Btn>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function formatWait(since) {
  if (!since) return "—";
  const m = Math.max(0, Math.floor((Date.now() - since) / 60000));
  return m < 1 ? "just now" : `${m} min`;
}

/* ---------------------------------------------------------------------------
   MATCH HISTORY
--------------------------------------------------------------------------- */
function HistoryPage() {
  const { state } = useStore();
  const t = useTheme();
  const rows = [...state.history].reverse();
  return (
    <div className="flex flex-col gap-2">
      {rows.length === 0 && <div className={`text-sm ${t.subtext}`}>No completed matches yet.</div>}
      {rows.map(m => {
        const dur = m.endedAt && m.startedAt ? Math.round((m.endedAt - m.startedAt) / 60000) : null;
        return (
          <Panel key={m.id} className="flex flex-wrap items-center gap-3 text-sm">
            <Badge tone="yellow">Round {m.round}</Badge>
            <span className={`font-medium ${t.subtext}`}>{m.courtName}</span>
            <span className="font-medium">{m.teamA.map(id => playerName(state.players, id)).join(" & ")}</span>
            <span className={t.subtext}>vs</span>
            <span className="font-medium">{m.teamB.map(id => playerName(state.players, id)).join(" & ")}</span>
            {m.status === "completed" && m.scoreA != null && (
              <Badge tone={m.winner === "A" ? "green" : m.winner === "B" ? "coral" : "gray"}>{m.scoreA} – {m.scoreB}</Badge>
            )}
            {m.status === "no-score" && <Badge tone="gray">No score</Badge>}
            {dur != null && <span className={`ml-auto text-xs ${t.subtext}`}>{dur} min</span>}
          </Panel>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   STATISTICS
--------------------------------------------------------------------------- */
function StatsPage() {
  const { state } = useStore();
  const t = useTheme();
  const checkedIn = state.players.filter(p => p.status !== "not-checked-in");
  const rows = [...checkedIn].sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  const courtUsage = state.courts.map(c => ({
    court: c.name,
    count: state.history.filter(m => m.courtId === c.id).length,
  }));

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <h3 className="text-sm font-semibold mb-3">Player statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-left ${t.subtext}`}>
                <th className="pb-2 font-medium">Player</th>
                <th className="pb-2 font-medium">GP</th>
                <th className="pb-2 font-medium">W</th>
                <th className="pb-2 font-medium">L</th>
                <th className="pb-2 font-medium">Win %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id} className={`border-t ${t.border}`}>
                  <td className="py-1.5 font-medium">{p.name}</td>
                  <td className="py-1.5">{p.gamesPlayed}</td>
                  <td className="py-1.5">{p.wins}</td>
                  <td className="py-1.5">{p.losses}</td>
                  <td className="py-1.5">{p.gamesPlayed ? Math.round((p.wins / p.gamesPlayed) * 100) : 0}%</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className={`py-3 ${t.subtext}`}>No checked-in players yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel>
        <h3 className="text-sm font-semibold mb-3">Court usage</h3>
        <div className="flex flex-col gap-2">
          {courtUsage.map(c => {
            const max = Math.max(1, ...courtUsage.map(x => x.count));
            return (
              <div key={c.court} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0">{c.court}</span>
                <div className={`h-2 flex-1 rounded-full ${t.panelSoft}`}>
                  <div className="h-2 rounded-full" style={{ width: `${(c.count / max) * 100}%`, background: YELLOW }} />
                </div>
                <span className={`w-8 text-right ${t.subtext}`}>{c.count}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   SESSION / SETTINGS
--------------------------------------------------------------------------- */
function SettingsPage() {
  const { state, dispatch } = useStore();
  const t = useTheme();
  const [name, setName] = useState(state.sessionName);
  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <Panel className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Session</h3>
        <Field label="Session name">
          <div className="flex gap-2">
            <TextInput value={name} onChange={e => setName(e.target.value)} />
            <Btn variant="yellow" onClick={() => dispatch({ type: "SET_SESSION_NAME", name })}><Save size={14} /> Save</Btn>
          </div>
        </Field>
        <div className={`text-xs ${t.subtext}`}>Saved automatically to this browser as you go.</div>
        <Btn variant="danger" className="w-fit" onClick={() => {
          if (confirm("Start a new session? This clears all current players, courts, and history.")) {
            dispatch({ type: "RESET_SESSION", name: "New session" });
          }
        }}><FolderOpen size={14} /> Start new session</Btn>
      </Panel>
      <Panel className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Round control</h3>
        <div className="flex items-center gap-2">
          <Btn variant="danger" onClick={() => { if (confirm("Shuffle the current round? Active matches will be cancelled and re-drawn.")) dispatch({ type: "SHUFFLE_ROUND" }); }}>
            <Shuffle size={14} /> Shuffle current round
          </Btn>
        </div>
      </Panel>
      <Panel className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Fairness algorithm</h3>
        <ul className={`text-xs leading-relaxed ${t.subtext} list-disc pl-4`}>
          <li>Repeated teammate: +100 penalty</li>
          <li>Repeated opponent: +40 penalty</li>
          <li>Above-average games played: +20 penalty</li>
          <li>Played in the last round: +25 penalty</li>
          <li>Waiting longest: up to −40 bonus</li>
        </ul>
        <div className={`text-xs ${t.subtext}`}>Every open court is filled with the 4-player, 2v2 grouping that scores lowest across all combinations of the longest-waiting players.</div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   APP SHELL
--------------------------------------------------------------------------- */
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "players", label: "Players", icon: Users },
  { id: "courts", label: "Courts", icon: LayoutGrid },
  { id: "queue", label: "Queue", icon: Clock },
  { id: "history", label: "History", icon: HistoryIcon },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "settings", label: "Session", icon: Settings },
];

function AppShell() {
  const { state, dispatch } = useStore();
  const t = useTheme();
  const [tab, setTab] = useState("dashboard");

  return (
    <div className={`op-root min-h-screen w-full ${t.page} transition-colors`}>
      <FontLoader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <header className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: YELLOW }}>
              <CircleDot size={18} color="#1F2B08" />
            </div>
            <div>
              <div className="op-score text-2xl leading-none tracking-wide">MASTERS/BESTIES OPEN PLAY</div>
              <div className={`text-xs -mt-0.5 ${t.subtext}`}>{state.sessionName} · round {state.round}</div>
            </div>
          </div>
          <Btn variant="ghost" onClick={() => dispatch({ type: "TOGGLE_DARK" })} title="Toggle theme">
            {t.dark ? <Sun size={16} /> : <Moon size={16} />}
          </Btn>
        </header>

        <nav className={`flex gap-1 overflow-x-auto pb-2 mb-4 border-b ${t.border}`}>
          {TABS.map(tb => {
            const Icon = tb.icon;
            const active = tab === tb.id;
            return (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap border-b-2 transition
                  ${active ? "border-[#D9F14A]" : "border-transparent opacity-60 hover:opacity-100"}`}>
                <Icon size={15} /> {tb.label}
              </button>
            );
          })}
        </nav>

        {tab === "dashboard" && <Dashboard />}
        {tab === "players" && <PlayersPage />}
        {tab === "courts" && <CourtsPage />}
        {tab === "queue" && <QueuePage />}
        {tab === "history" && <HistoryPage />}
        {tab === "stats" && <StatsPage />}
        {tab === "settings" && <SettingsPage />}
      </div>
    </div>
  );
}

export default function OpenPlayApp() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

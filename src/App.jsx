import React, { useEffect, useMemo, useReducer, useRef, useState, createContext, useContext } from "react";
import {
  Users, UserCheck, Clock, LayoutGrid, Trophy, RotateCw, Settings, Moon, Sun,
  Plus, Search, Check, X, Pencil, Trash2, ChevronUp, ChevronDown, Pause, Play,
  Shuffle, History as HistoryIcon, BarChart3, Save, FolderOpen, LogOut, LogIn,
  CircleDot, ChevronRight, Timer, Database, Eye, ArrowRightLeft, CheckCheck,
  Loader2, CheckCircle2, Info, ShieldAlert
} from "lucide-react";

const LOGO_DATA_URI = "data:image/jpeg;base64,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";

/* ============================================================================
   MASTERS/BESTIES OPEN PLAY — PICKLEBALL MATCH MANAGER
   Design language: "the scoreboard court" — a deep court-blue and optic-yellow
   palette, condensed scoreboard numerals for rounds/scores, and match cards
   drawn as literal courts (net line down the middle) so the UI reads as
   pickleball, not a generic admin panel.
   ========================================================================== */

/* ---------------------------------------------------------------------------
   FONTS
--------------------------------------------------------------------------- */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Teko:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
    .op-root { font-family: 'Inter', system-ui, sans-serif; }
    .op-score { font-family: 'Teko', sans-serif; letter-spacing: 0.01em; }
    @keyframes op-toast-in { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .op-toast { animation: op-toast-in 0.2s ease-out; }
    @keyframes op-spin { to { transform: rotate(360deg); } }
    .op-spin { animation: op-spin 0.8s linear infinite; }
    .op-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
    @keyframes op-modal-in { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes op-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
    .op-modal { animation: op-modal-in 0.2s cubic-bezier(0.16,1,0.3,1); }
    .op-backdrop { animation: op-backdrop-in 0.15s ease-out; }
  `}</style>
);

/* ---------------------------------------------------------------------------
   PERSISTENCE ADAPTER — uses the artifact's window.storage when present
   (chat preview), falls back to real browser localStorage when deployed
   as a standalone site. Same file works in both places.
--------------------------------------------------------------------------- */
const persist = {
  async get(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  },
  async set(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  },
};

/* ---------------------------------------------------------------------------
   SCHEDULER MODULE — pure functions, independent of UI / React.
   Exposed: pairKey, partnerCount, opponentCount, calculateFairnessScore,
   buildTeams, getWaitingPlayers, generateMatches
--------------------------------------------------------------------------- */
import { Scheduler } from "./scheduler.js";


/* ---------------------------------------------------------------------------
   TYPES (documented via JSDoc since this runtime executes plain JS/JSX)
   Player: { id, name, gender?, skill, status, gamesPlayed, wins, losses,
             checkInTime?, waitingSince?, paused?, courtId?, lastPlayedRound? }
   status: 'not-checked-in' | 'waiting' | 'assigned' (in a pending match) | 'playing'
   Court:  { id, name, enabled }
   Match:  { id, courtId, courtName, round, teamA:[id,id], teamB:[id,id],
             status: 'pending'|'active'|'completed'|'no-score',
             scoreA?, scoreB?, winner?, startedAt, endedAt? }
   SavedPlayer (player DB): { id, name, gender, skill }
   ArchivedSession: { id, name, endedAt, playerCount, courtCount, matches, players }
--------------------------------------------------------------------------- */

const uid = () => Math.random().toString(36).slice(2, 10);
const SKILLS = ["Beginner", "Intermediate", "Advanced", "Open"];

function formatSessionDate(d = new Date()) {
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${weekday}, ${mm}/${dd}/${d.getFullYear()}`;
}

function makeInitialCourts() {
  return [1, 2, 3, 4].map(n => ({ id: uid(), name: `Court ${n}`, enabled: true }));
}

const initialState = {
  sessionName: formatSessionDate(),
  players: [],
  courts: makeInitialCourts(),
  matches: [],
  history: [],
  round: 1,
  darkMode: false,
};

// Fill any empty, enabled courts with a *pending* match proposal (requires
// an explicit "Start match" click before it counts as active / starts a timer).
function fillEmptyCourts(state) {
  const busyCourtIds = new Set(state.matches.map(m => m.courtId));
  const emptyCourts = state.courts.filter(c => c.enabled && !busyCourtIds.has(c.id));
  if (emptyCourts.length === 0) return state;
  const waiting = Scheduler.getWaitingPlayers(state.players);
  const groups = Scheduler.generateMatches(emptyCourts, waiting, state.players, state.history, state.round);
  if (groups.length === 0) return state;
  const newMatches = groups.map(g => ({
    id: uid(), courtId: g.court.id, courtName: g.court.name, round: state.round,
    teamA: [g.teamA[0].id, g.teamA[1].id], teamB: [g.teamB[0].id, g.teamB[1].id],
    status: "pending", startedAt: null,
  }));
  const assignedIds = new Set(newMatches.flatMap(m => [...m.teamA, ...m.teamB]));
  const players = state.players.map(p => assignedIds.has(p.id)
    ? { ...p, status: "assigned", courtId: newMatches.find(m => m.teamA.includes(p.id) || m.teamB.includes(p.id)).courtId }
    : p);
  return { ...state, matches: [...state.matches, ...newMatches], players };
}

// Return the 4 players of a match to the waiting queue, at the front
// (used when a court is disabled/removed out from under a match).
function evictMatch(state, matchId) {
  const m = state.matches.find(x => x.id === matchId);
  if (!m) return state;
  const ids = new Set([...m.teamA, ...m.teamB]);
  const earliest = Math.min(0, ...state.players.filter(p => p.waitingSince != null).map(p => p.waitingSince)) - 1;
  return {
    ...state,
    matches: state.matches.filter(x => x.id !== matchId),
    players: state.players.map(p => ids.has(p.id)
      ? { ...p, status: "waiting", waitingSince: earliest, courtId: null } : p),
  };
}

/* ---------------------------------------------------------------------------
   MAIN SESSION REDUCER
--------------------------------------------------------------------------- */
function reducer(state, action) {
  switch (action.type) {
    case "LOAD_STATE":
      return { ...initialState, ...action.payload };

    case "RESET_SESSION":
      return { ...initialState, courts: makeInitialCourts(), sessionName: action.name || formatSessionDate() };

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
    case "ADD_FROM_DB": {
      // action.entries: [{name, gender, skill}] pulled from the saved player database
      const existingNames = new Set(state.players.map(p => p.name.toLowerCase()));
      const toAdd = action.entries.filter(e => !existingNames.has(e.name.toLowerCase()));
      const newPlayers = toAdd.map(e => ({
        id: uid(), name: e.name, gender: e.gender || "", skill: e.skill || "Open",
        status: "not-checked-in", gamesPlayed: 0, wins: 0, losses: 0,
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
    case "CHECK_IN_ALL": {
      const now = Date.now();
      return {
        ...state,
        players: state.players.map(p => p.status === "not-checked-in"
          ? { ...p, status: "waiting", checkInTime: now, waitingSince: now } : p),
      };
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
      let next = { ...state, courts: [...state.courts, { id: uid(), name: action.name, enabled: true }] };
      return fillEmptyCourts(next);
    }
    case "UPDATE_COURT": {
      let next = { ...state, courts: state.courts.map(c => c.id === action.id ? { ...c, ...action.patch } : c) };
      if (action.patch && action.patch.enabled === false) {
        const m = next.matches.find(x => x.courtId === action.id);
        if (m) next = evictMatch(next, m.id);
      }
      return fillEmptyCourts(next);
    }
    case "REMOVE_COURT": {
      const m = state.matches.find(x => x.courtId === action.id);
      let next = m ? evictMatch(state, m.id) : state;
      next = { ...next, courts: next.courts.filter(c => c.id !== action.id) };
      return fillEmptyCourts(next);
    }

    /* ---------------- matches ---------------- */
    case "GENERATE_MATCHES": {
      return fillEmptyCourts(state);
    }

    case "START_MATCH": {
      const now = Date.now();
      const m = state.matches.find(x => x.id === action.id);
      if (!m || m.status !== "pending") return state;
      const ids = new Set([...m.teamA, ...m.teamB]);
      return {
        ...state,
        matches: state.matches.map(x => x.id === action.id ? { ...x, status: "active", startedAt: now } : x),
        players: state.players.map(p => ids.has(p.id) ? { ...p, status: "playing" } : p),
      };
    }

    case "CANCEL_MATCH": {
      return evictMatch(state, action.id);
    }

    case "RESET_MATCH": {
      // Explicitly reopen an in-progress match for editing: same as cancel,
      // but framed for the "unlock this court" use case.
      return evictMatch(state, action.id);
    }

    case "SWAP_OPPONENTS": {
      // Once a match is in progress, the only edit allowed is trading a
      // player with their direct opponent on the SAME court — teammate
      // pairs never change, and no outside/waiting player can enter.
      const m = state.matches.find(x => x.id === action.matchId && x.status === "active");
      if (!m) return state;
      const { idA, idB } = action;
      const aInA = m.teamA.includes(idA), aInB = m.teamB.includes(idA);
      const bInA = m.teamA.includes(idB), bInB = m.teamB.includes(idB);
      const validOpponentPair = (aInA && bInB) || (aInB && bInA);
      if (!validOpponentPair) return state;
      const teamA = m.teamA.map(id => id === idA ? idB : id === idB ? idA : id);
      const teamB = m.teamB.map(id => id === idA ? idB : id === idB ? idA : id);
      return { ...state, matches: state.matches.map(x => x.id === m.id ? { ...x, teamA, teamB } : x) };
    }

    case "SWAP_PLAYERS": {
      const { idA, idB } = action;
      if (!idA || !idB || idA === idB) return state;
      const pA = state.players.find(p => p.id === idA);
      const pB = state.players.find(p => p.id === idB);
      if (!pA || !pB) return state;
      // Only players who are waiting or in a not-yet-started (pending) match
      // may be swapped. Anyone already playing is off-limits.
      const swappable = p => p.status === "waiting" || p.status === "assigned";
      if (!swappable(pA) || !swappable(pB)) return state;

      const locate = (id) => {
        if (pA.id === id && pA.status === "waiting") return { type: "waiting" };
        if (pB.id === id && pB.status === "waiting") return { type: "waiting" };
        const m = state.matches.find(x => (x.teamA.includes(id) || x.teamB.includes(id)) && x.status === "pending");
        if (!m) return null;
        const team = m.teamA.includes(id) ? "teamA" : "teamB";
        return { type: "match", matchId: m.id, team };
      };
      const locA = locate(idA), locB = locate(idB);
      if (!locA || !locB) return state; // defensive: found in an active match or nowhere

      let matches = state.matches;
      const swapIn = (matchId, team, oldId, newId) => {
        matches = matches.map(m => m.id === matchId
          ? { ...m, [team]: m[team].map(id => id === oldId ? newId : id) }
          : m);
      };

      if (locA.type === "match") swapIn(locA.matchId, locA.team, idA, idB);
      if (locB.type === "match") swapIn(locB.matchId, locB.team, idB, idA);

      const now = Date.now();
      const players = state.players.map(p => {
        if (p.id === idA) {
          if (locB.type === "waiting") return { ...p, status: "waiting", waitingSince: now, courtId: null };
          const m = matches.find(x => x.id === locB.matchId);
          return { ...p, status: "assigned", courtId: m.courtId };
        }
        if (p.id === idB) {
          if (locA.type === "waiting") return { ...p, status: "waiting", waitingSince: now, courtId: null };
          const m = matches.find(x => x.id === locA.matchId);
          return { ...p, status: "assigned", courtId: m.courtId };
        }
        return p;
      });

      return { ...state, players, matches };
    }

    case "FINISH_MATCH": {
      const m = state.matches.find(x => x.id === action.id);
      if (!m) return state;
      const now = Date.now();
      let winner;
      if (action.mode === "score") {
        winner = action.scoreA > action.scoreB ? "A" : action.scoreB > action.scoreA ? "B" : undefined;
      } else if (action.mode === "no-score") {
        winner = action.winner === "A" || action.winner === "B" ? action.winner : undefined;
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
      const stillActiveThisRound = remainingMatches.some(x => x.round === round && x.status === "active");
      if (!stillActiveThisRound) {
        round = round + 1;
        // Not-yet-started proposals should always reflect the round they'll
        // actually be played in, not the round they were originally drafted in.
        remainingMatches = remainingMatches.map(x => x.status === "pending" ? { ...x, round } : x);
      }

      let history = [...state.history, finished];

      // Do NOT auto-start the next match — just propose it (status "pending")
      // so the organizer manually presses "Start match".
      return fillEmptyCourts({ ...state, players, matches: remainingMatches, history, round });
    }

    case "SHUFFLE_ROUND": {
      // Re-draw only the not-yet-started proposals; matches already in
      // progress are left completely alone.
      const pending = state.matches.filter(m => m.status === "pending");
      const active = state.matches.filter(m => m.status === "active");
      const releasedIds = new Set(pending.flatMap(m => [...m.teamA, ...m.teamB]));
      const players = state.players.map(p => releasedIds.has(p.id)
        ? { ...p, status: "waiting", waitingSince: Date.now(), courtId: null } : p);
      return fillEmptyCourts({ ...state, players, matches: active });
    }

    default:
      return state;
  }
}

/* ---------------------------------------------------------------------------
   PLAYER DATABASE REDUCER — persists across sessions
--------------------------------------------------------------------------- */
function dbReducer(dbState, action) {
  switch (action.type) {
    case "LOAD": return action.payload || [];
    case "UPSERT_MANY": {
      const existingLower = new Set(dbState.map(p => p.name.toLowerCase()));
      const additions = action.entries
        .filter(e => e.name && e.name.trim() && !existingLower.has(e.name.trim().toLowerCase()))
        .map(e => ({ id: uid(), name: e.name.trim(), gender: e.gender || "", skill: e.skill || "Open" }));
      return [...dbState, ...additions];
    }
    case "UPDATE": return dbState.map(p => p.id === action.id ? { ...p, ...action.patch } : p);
    case "REMOVE": return dbState.filter(p => p.id !== action.id);
    default: return dbState;
  }
}

/* ---------------------------------------------------------------------------
   SESSION HISTORY (ARCHIVE) REDUCER
--------------------------------------------------------------------------- */
function archiveReducer(archiveState, action) {
  switch (action.type) {
    case "LOAD": return action.payload || [];
    case "ARCHIVE": return [action.entry, ...archiveState];
    case "REMOVE": return archiveState.filter(s => s.id !== action.id);
    default: return archiveState;
  }
}

const STORAGE_KEY = "openplay:session";
const DB_KEY = "openplay:playerdb";
const ARCHIVE_KEY = "openplay:sessionhistory";

const StoreCtx = createContext(null);
function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

const TOAST_MESSAGES = {
  CHECK_IN: { message: "Player checked in", tone: "success" },
  CHECK_IN_ALL: { message: "All players checked in", tone: "success" },
  START_MATCH: { message: "Match started", tone: "info" },
  FINISH_MATCH: { message: "Match finished", tone: "success" },
  CANCEL_MATCH: { message: "Match cancelled — players returned to the queue", tone: "warning" },
  ADD_COURT: { message: "Court added", tone: "success" },
  UPDATE_COURT_DISABLE: { message: "Court disabled — matches redistributed", tone: "warning" },
  REMOVE_COURT: { message: "Court removed — matches redistributed", tone: "warning" },
  ADD_PLAYER: { message: "Player added", tone: "success" },
  BULK_ADD_PLAYERS: { message: "Players imported", tone: "success" },
  ADD_FROM_DB: { message: "Players added from saved list", tone: "success" },
  REMOVE_PLAYER: { message: "Player removed", tone: "warning" },
  RESET_SESSION: { message: "Session saved to history — new session started", tone: "success" },
  SHUFFLE_ROUND: { message: "Round shuffled", tone: "info" },
};

function StoreProvider({ children }) {
  const [state, dispatchRaw] = useReducer(reducer, initialState);
  const [db, dbDispatch] = useReducer(dbReducer, []);
  const [archive, archiveDispatch] = useReducer(archiveReducer, []);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [swapTarget, setSwapTarget] = useState(null); // playerId currently being reassigned
  const [confirmDialog, setConfirmDialog] = useState(null); // {title,message,confirmLabel,tone,onConfirm}
  const [endMatchTarget, setEndMatchTarget] = useState(null); // match currently being ended
  const loaded = useRef(false);

  function pushToast(message, tone = "info") {
    const id = uid();
    setToasts(prev => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  }
  function dismissToast(id) { setToasts(prev => prev.filter(t => t.id !== id)); }

  function openSwap(id) {
    const player = state.players.find(p => p.id === id);
    if (!player || player.status === "not-checked-in") return;
    setSwapTarget(id);
  }
  function closeSwap() { setSwapTarget(null); }

  // Perform the swap chosen from the SwapPlayerDialog. Handles both the
  // free-form (pending/waiting) case and the opponent-only (active) case.
  function completeSwap(otherId) {
    const a = state.players.find(p => p.id === swapTarget);
    const b = state.players.find(p => p.id === otherId);
    if (!a || !b) { setSwapTarget(null); return; }
    if (a.status === "playing" && b.status === "playing") {
      const m = state.matches.find(x => x.status === "active" &&
        ((x.teamA.includes(a.id) && x.teamB.includes(b.id)) || (x.teamB.includes(a.id) && x.teamA.includes(b.id))));
      if (m) { dispatch({ type: "SWAP_OPPONENTS", matchId: m.id, idA: a.id, idB: b.id }); pushToast("Opponents swapped", "success"); }
    } else {
      dispatch({ type: "SWAP_PLAYERS", idA: a.id, idB: b.id });
      pushToast("Players swapped", "success");
    }
    setSwapTarget(null);
  }

  function askConfirm({ title, message, confirmLabel = "Confirm", tone = "danger", onConfirm }) {
    setConfirmDialog({ title, message, confirmLabel, tone, onConfirm });
  }

  function openEndMatch(match) { setEndMatchTarget(match); }
  function closeEndMatch() { setEndMatchTarget(null); }

  useEffect(() => {
    (async () => {
      const [sess, dbRaw, archRaw] = await Promise.all([
        persist.get(STORAGE_KEY), persist.get(DB_KEY), persist.get(ARCHIVE_KEY),
      ]);
      if (sess) dispatchRaw({ type: "LOAD_STATE", payload: JSON.parse(sess) });
      if (dbRaw) dbDispatch({ type: "LOAD", payload: JSON.parse(dbRaw) });
      if (archRaw) archiveDispatch({ type: "LOAD", payload: JSON.parse(archRaw) });
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (loaded.current) persist.set(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { if (loaded.current) persist.set(DB_KEY, JSON.stringify(db)); }, [db]);
  useEffect(() => { if (loaded.current) persist.set(ARCHIVE_KEY, JSON.stringify(archive)); }, [archive]);

  // Wrapper dispatch: keeps the player database in sync whenever players
  // are added to the live session, archives the session on reset, and
  // surfaces a toast notification for the actions people care about seeing.
  function dispatch(action) {
    if (action.type === "ADD_PLAYER") {
      dbDispatch({ type: "UPSERT_MANY", entries: [{ name: action.name, gender: action.gender, skill: action.skill }] });
    }
    if (action.type === "BULK_ADD_PLAYERS") {
      dbDispatch({ type: "UPSERT_MANY", entries: action.names.map(n => ({ name: n })) });
    }
    if (action.type === "RESET_SESSION") {
      if (state.players.length > 0 || state.history.length > 0) {
        archiveDispatch({
          type: "ARCHIVE",
          entry: {
            id: uid(),
            name: state.sessionName,
            endedAt: Date.now(),
            playerCount: state.players.length,
            courtCount: state.courts.length,
            matches: state.history,
            players: state.players.map(p => ({ id: p.id, name: p.name, gamesPlayed: p.gamesPlayed, wins: p.wins, losses: p.losses })),
          },
        });
      }
    }
    let toastKey = action.type;
    if (action.type === "UPDATE_COURT" && action.patch && action.patch.enabled === false) toastKey = "UPDATE_COURT_DISABLE";
    const t = TOAST_MESSAGES[toastKey];
    if (t) pushToast(t.message, t.tone);
    dispatchRaw(action);
  }

  return (
    <StoreCtx.Provider value={{
      state, dispatch, db, dbDispatch, archive, archiveDispatch, ready, toasts, dismissToast,
      swapTarget, openSwap, closeSwap, completeSwap,
      confirmDialog, askConfirm, closeConfirm: () => setConfirmDialog(null),
      endMatchTarget, openEndMatch, closeEndMatch,
    }}>
      {children}
    </StoreCtx.Provider>
  );
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
const PURPLE = "#9B7BD6";

const statusColor = {
  "not-checked-in": { dot: "#9AA5A0", text: "text-gray-400" },
  "waiting": { dot: "#F5A623", text: "text-orange-500" },
  "assigned": { dot: PURPLE, text: "text-purple-400" },
  "playing": { dot: BLUE, text: "text-blue-500" },
};

/* ---------------------------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------------------------- */
function Btn({ children, onClick, variant = "default", className = "", disabled, title, type = "button" }) {
  const t = useTheme();
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2.5 min-h-[42px] text-sm font-medium transition active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed select-none";
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
    purple: "bg-[#9B7BD6]/15 text-[#6C4FA8]",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function Panel({ children, className = "" }) {
  const t = useTheme();
  return <div className={`op-card rounded-2xl ${t.panel} p-4 ${className}`}>{children}</div>;
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
  const activeMatches = state.matches.filter(m => m.status === "active").length;
  const availableCourts = state.courts.filter(c => c.enabled).length;
  const notCheckedIn = state.players.filter(p => p.status === "not-checked-in").length;
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

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Courts</h2>
        <div className="flex gap-2">
          {notCheckedIn > 0 && (
            <Btn onClick={() => dispatch({ type: "CHECK_IN_ALL" })}><CheckCheck size={15} /> Check in all ({notCheckedIn})</Btn>
          )}
          {emptyCourts.length > 0 && Scheduler.getWaitingPlayers(state.players).length >= 4 && (
            <Btn variant="yellow" onClick={() => dispatch({ type: "GENERATE_MATCHES" })}>
              <Plus size={16} /> Propose match{emptyCourts.length > 1 ? "es" : ""} for {emptyCourts.length} court{emptyCourts.length > 1 ? "s" : ""}
            </Btn>
          )}
        </div>
      </div>
      <CourtGrid />
    </div>
  );
}

/* ---------------------------------------------------------------------------
   COURT / MATCH CARD  — the signature visual: a literal court with a net
--------------------------------------------------------------------------- */
function TeamSlotColored({ ids, players, align, swappable, onPick }) {
  return (
    <div className={`flex flex-col gap-1 ${align === "right" ? "items-end text-right" : ""}`}>
      {ids.map(id => {
        const name = playerName(players, id);
        if (!swappable) {
          return <div key={id} className="truncate text-sm font-semibold" style={{ color: "#EFF7DE" }}>{name}</div>;
        }
        return (
          <button key={id} onClick={() => onPick(id)}
            className={`truncate text-sm font-semibold flex items-center gap-1 rounded px-1 -mx-1 transition hover:bg-white/10 ${align === "right" ? "flex-row-reverse" : ""}`}
            style={{ color: "#EFF7DE" }} title="Swap this player">
            <ArrowRightLeft size={11} className="opacity-70 shrink-0" />
            {name}
          </button>
        );
      })}
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

function MatchCard({ match, court }) {
  const { state, dispatch, openSwap, askConfirm, openEndMatch } = useStore();
  const t = useTheme();
  const [scoreOpen, setScoreOpen] = useState(false);
  const [scoreA, setScoreA] = useState("11");
  const [scoreB, setScoreB] = useState("7");
  const elapsed = useElapsed(match?.status === "active" ? match.startedAt : null);
  const isPending = match?.status === "pending";
  const isActive = match?.status === "active";

  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: isActive ? BLUE : isPending ? PURPLE : "#9AA5A0" }} />
          <span className="font-semibold text-sm">{court.name}</span>
          {isPending && <Badge tone="purple">Up next</Badge>}
        </div>
        {isActive && (
          <span className={`text-xs op-score text-base ${t.subtext}`}><Timer size={12} className="inline -mt-0.5 mr-1" />{elapsed}</span>
        )}
      </div>

      {match ? (
        <>
          <div className="relative rounded-xl overflow-hidden" style={{ background: t.dark ? "#0C2634" : "#123B52", opacity: isPending ? 0.85 : 1 }}>
            <div className="flex">
              <div className="flex-1 p-3 relative">
                <TeamSlotColored ids={match.teamA} players={state.players} swappable={isPending || isActive} onPick={openSwap} />
              </div>
              <div className="w-[3px] shrink-0" style={{ background: YELLOW }} />
              <div className="flex-1 p-3">
                <TeamSlotColored ids={match.teamB} players={state.players} align="right" swappable={isPending || isActive} onPick={openSwap} />
              </div>
            </div>
          </div>

          {isPending && (
            <div className="flex gap-2">
              <Btn variant="yellow" className="flex-1" onClick={() => dispatch({ type: "START_MATCH", id: match.id })}>
                <Play size={15} /> Start match
              </Btn>
              <Btn variant="danger" onClick={() => dispatch({ type: "CANCEL_MATCH", id: match.id })} title="Send players back to queue">
                <X size={15} />
              </Btn>
            </div>
          )}

          {isActive && !scoreOpen && (
            <div className="flex gap-2">
              <Btn variant="yellow" className="flex-1" onClick={() => setScoreOpen(true)}>
                <Check size={15} /> Finish match
              </Btn>
              <Btn variant="danger" onClick={() => askConfirm({
                title: "Reset match",
                message: "Players will return to the queue and no stats will be recorded. Do this to change who's playing.",
                confirmLabel: "Reset match",
                onConfirm: () => dispatch({ type: "RESET_MATCH", id: match.id }),
              })} title="Reset match to change players">
                <X size={15} />
              </Btn>
            </div>
          )}

          {isActive && scoreOpen && (
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
                <Btn className="flex-1" onClick={() => { openEndMatch(match); setScoreOpen(false); }}>
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
function exportPlayersTxt(names) {
  const blob = new Blob([names.join("\n") + "\n"], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "open-play-players.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function PlayersPage() {
  const { state, dispatch, db } = useStore();
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = state.players
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  const notCheckedIn = state.players.filter(p => p.status === "not-checked-in").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={15} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${t.subtext}`} />
            <TextInput placeholder="Search players" value={query} onChange={e => setQuery(e.target.value)} className="pl-8 w-56" />
          </div>
          <Btn onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} title="Toggle sort order">
            {sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {sortDir === "asc" ? "A → Z" : "Z → A"}
          </Btn>
        </div>
        <div className="flex flex-wrap gap-2">
          {notCheckedIn > 0 && <Btn onClick={() => dispatch({ type: "CHECK_IN_ALL" })}><CheckCheck size={15} /> Check in all</Btn>}
          <Btn onClick={() => setShowSaved(true)}><Database size={15} /> Add from saved</Btn>
          <Btn onClick={() => setShowBulk(true)}><Plus size={15} /> Bulk import</Btn>
          <Btn onClick={() => exportPlayersTxt(db.map(p => p.name).sort((a, b) => a.localeCompare(b)))} title="Export every saved player to a .txt file">
            <Save size={15} /> Export players
          </Btn>
          <Btn variant="yellow" onClick={() => setShowAdd(true)}><Plus size={15} /> Add player</Btn>
        </div>
      </div>

      {showAdd && <AddPlayerForm onClose={() => setShowAdd(false)} />}
      {showBulk && <BulkImportForm onClose={() => setShowBulk(false)} />}
      {showSaved && <SavedPlayersPicker onClose={() => setShowSaved(false)} />}
      {editing && <AddPlayerForm player={editing} onClose={() => setEditing(null)} />}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(p => <PlayerCard key={p.id} player={p} onEdit={() => setEditing(p)} />)}
        {filtered.length === 0 && <div className={`text-sm ${t.subtext}`}>No players yet. Add one, or pull from your saved player database.</div>}
      </div>
    </div>
  );
}

function PlayerCard({ player: p, onEdit }) {
  const { dispatch, askConfirm } = useStore();
  const t = useTheme();
  const sc = statusColor[p.status] || statusColor["not-checked-in"];
  const label = p.status === "playing" ? "Playing" : p.status === "assigned" ? "Up next" : p.status === "waiting" ? "Waiting" : "Not checked in";
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
          <Btn className="flex-1" disabled={p.status === "playing" || p.status === "assigned"} onClick={() => dispatch({ type: "CHECK_OUT", id: p.id })}>
            <LogOut size={14} /> Check out
          </Btn>
        )}
        <Btn variant="ghost" onClick={onEdit} title="Edit"><Pencil size={14} /></Btn>
        <Btn variant="ghost" onClick={() => askConfirm({
          title: "Remove player",
          message: `Remove ${p.name} from this session? Their stats for this session will be lost.`,
          confirmLabel: "Remove",
          onConfirm: () => dispatch({ type: "REMOVE_PLAYER", id: p.id }),
        })} title="Remove"><Trash2 size={14} /></Btn>
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

function SavedPlayersPicker({ onClose }) {
  const { state, dispatch, db } = useStore();
  const t = useTheme();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const inSession = new Set(state.players.map(p => p.name.toLowerCase()));
  const available = db.filter(p => !inSession.has(p.name.toLowerCase()) && p.name.toLowerCase().includes(query.toLowerCase()));

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Saved players ({db.length})</h3>
        <TextInput placeholder="Search" value={query} onChange={e => setQuery(e.target.value)} className="w-40" />
      </div>
      {available.length === 0 ? (
        <div className={`text-sm ${t.subtext}`}>{db.length === 0 ? "No saved players yet — players you add are saved automatically for next time." : "Everyone matching that search is already in this session."}</div>
      ) : (
        <div className="max-h-64 overflow-y-auto flex flex-col gap-1">
          {available.map(p => (
            <label key={p.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm cursor-pointer ${t.hover}`}>
              <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} />
              <span className="font-medium">{p.name}</span>
              <span className={`text-xs ${t.subtext}`}>{p.skill}</span>
            </label>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Btn variant="yellow" disabled={selected.size === 0} onClick={() => {
          const entries = db.filter(p => selected.has(p.id)).map(p => ({ name: p.name, gender: p.gender, skill: p.skill }));
          dispatch({ type: "ADD_FROM_DB", entries });
          onClose();
        }}>Add {selected.size > 0 ? selected.size : ""} to session</Btn>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   COURTS
--------------------------------------------------------------------------- */
function CourtsPage() {
  const { state, dispatch, askConfirm } = useStore();
  const t = useTheme();
  const [name, setName] = useState("");
  const byCourtId = useMemo(() => {
    const map = {};
    state.matches.forEach(m => { map[m.courtId] = m; });
    return map;
  }, [state.matches]);

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
        {state.courts.map(c => {
          const m = byCourtId[c.id];
          return (
            <Panel key={c.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <TextInput value={c.name} onChange={e => dispatch({ type: "UPDATE_COURT", id: c.id, patch: { name: e.target.value } })} />
                <div className="flex items-center gap-1 shrink-0">
                  <Btn variant={c.enabled ? "yellow" : "default"} onClick={() => dispatch({ type: "UPDATE_COURT", id: c.id, patch: { enabled: !c.enabled } })}>
                    {c.enabled ? "Enabled" : "Disabled"}
                  </Btn>
                  <Btn variant="ghost" onClick={() => askConfirm({
                    title: "Remove court",
                    message: m
                      ? `Remove ${c.name}? Its match will be cancelled and those players sent back to the queue.`
                      : `Remove ${c.name}?`,
                    confirmLabel: "Remove",
                    onConfirm: () => dispatch({ type: "REMOVE_COURT", id: c.id }),
                  })}><Trash2 size={14} /></Btn>
                </div>
              </div>
              {m && <div className={`text-xs ${t.subtext}`}>{m.status === "active" ? "Match in progress" : "Match proposed"} — will redistribute if disabled</div>}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   QUEUE
--------------------------------------------------------------------------- */
function QueuePage() {
  const { state, dispatch, openSwap } = useStore();
  const t = useTheme();
  const waiting = state.players.filter(p => p.status === "waiting").sort((a, b) => {
    if (!!a.paused !== !!b.paused) return a.paused ? 1 : -1;
    return (a.waitingSince ?? 0) - (b.waitingSince ?? 0);
  });
  const assigned = state.players.filter(p => p.status === "assigned");
  return (
    <div className="flex flex-col gap-2">
      {assigned.length > 0 && (
        <div className={`text-xs ${t.subtext} mb-1`}>{assigned.length} player{assigned.length > 1 ? "s" : ""} in an up-next match, waiting to start.</div>
      )}
      {waiting.length === 0 && <div className={`text-sm ${t.subtext}`}>No one is waiting right now.</div>}
      {waiting.map((p, i) => (
        <Panel key={p.id} className="flex items-center gap-3">
          <div className="op-score text-2xl w-8 text-center" style={{ color: p.paused ? "#9AA5A0" : YELLOW_DK }}>{i + 1}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate">{p.name} {p.paused && <span className={`text-xs font-normal ${t.subtext}`}>(paused)</span>}</div>
            <div className={`text-xs ${t.subtext}`}>GP {p.gamesPlayed} · waiting {formatWait(p.waitingSince)}</div>
          </div>
          <div className="flex items-center gap-1">
            <Btn variant="ghost" onClick={() => openSwap(p.id)} title="Swap into a match"><ArrowRightLeft size={14} /></Btn>
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
function MatchHistoryRows({ matches, players }) {
  const t = useTheme();
  const rows = [...matches].reverse();
  if (rows.length === 0) return <div className={`text-sm ${t.subtext}`}>No completed matches yet.</div>;
  return (
    <div className="flex flex-col gap-2">
      {rows.map(m => {
        const dur = m.endedAt && m.startedAt ? Math.round((m.endedAt - m.startedAt) / 60000) : null;
        return (
          <Panel key={m.id} className="flex flex-wrap items-center gap-3 text-sm">
            <Badge tone="yellow">Round {m.round}</Badge>
            <span className={`font-medium ${t.subtext}`}>{m.courtName}</span>
            <span className="font-medium">{m.teamA.map(id => playerName(players, id)).join(" & ")}</span>
            <span className={t.subtext}>vs</span>
            <span className="font-medium">{m.teamB.map(id => playerName(players, id)).join(" & ")}</span>
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

function HistoryPage() {
  const { state } = useStore();
  return <MatchHistoryRows matches={state.history} players={state.players} />;
}

/* ---------------------------------------------------------------------------
   STATISTICS
--------------------------------------------------------------------------- */
function StatsTable({ rows }) {
  const t = useTheme();
  return (
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
  );
}

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
        <StatsTable rows={rows} />
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
   SESSION HISTORY VIEWER (read-only, renders from an archived snapshot)
--------------------------------------------------------------------------- */
function ArchivedSessionViewer({ session, onClose }) {
  const t = useTheme();
  const rows = [...session.players].sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  return (
    <Modal title={session.name} icon={Eye} onClose={onClose} maxWidth="max-w-2xl">
      <div className={`text-xs ${t.subtext} -mt-3 mb-4`}>
        {new Date(session.endedAt).toLocaleString()} · {session.playerCount} players · {session.courtCount} courts
      </div>
      <div className="flex flex-col gap-4 max-h-[65vh] overflow-y-auto">
        <div>
          <h4 className="text-sm font-semibold mb-2">Final player statistics</h4>
          <StatsTable rows={rows} />
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-2">Match history</h4>
          <MatchHistoryRows matches={session.matches} players={session.players} />
        </div>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
   SESSION / SETTINGS
--------------------------------------------------------------------------- */
function SettingsPage() {
  const { state, dispatch, archive, askConfirm } = useStore();
  const t = useTheme();
  const [name, setName] = useState(state.sessionName);
  const [viewing, setViewing] = useState(null);

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <Panel className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Session</h3>
        <Field label="Session name">
          <div className="flex gap-2">
            <TextInput value={name} onChange={e => setName(e.target.value)} />
            <Btn variant="yellow" onClick={() => dispatch({ type: "SET_SESSION_NAME", name })}><Save size={14} /> Save</Btn>
          </div>
        </Field>
        <div className={`text-xs ${t.subtext}`}>Saved automatically to this browser as you go, so a refresh won't lose your session.</div>
        <Btn variant="danger" className="w-fit" onClick={() => askConfirm({
          title: "End session",
          message: "End this session and start a new one? The current session will be saved to Session history first.",
          confirmLabel: "End session",
          onConfirm: () => dispatch({ type: "RESET_SESSION" }),
        })}><FolderOpen size={14} /> End session & start new</Btn>
      </Panel>

      <Panel className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Round control</h3>
        <div className="flex items-center gap-2">
          <Btn variant="danger" onClick={() => askConfirm({
            title: "Shuffle current round",
            message: "Matches not yet started will be re-drawn. Matches already in progress are left alone.",
            confirmLabel: "Shuffle",
            onConfirm: () => dispatch({ type: "SHUFFLE_ROUND" }),
          })}>
            <Shuffle size={14} /> Shuffle current round
          </Btn>
        </div>
      </Panel>

      <Panel className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Session history ({archive.length})</h3>
        {archive.length === 0 ? (
          <div className={`text-sm ${t.subtext}`}>Past sessions will show up here once you end one.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {archive.map(s => (
              <div key={s.id} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 ${t.panelSoft}`}>
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className={`text-xs ${t.subtext}`}>{new Date(s.endedAt).toLocaleDateString()} · {s.playerCount} players · {s.courtCount} courts</div>
                </div>
                <Btn onClick={() => setViewing(s)}><Eye size={14} /> View</Btn>
              </div>
            ))}
          </div>
        )}
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
        <div className={`text-xs ${t.subtext}`}>Every open court gets a proposed 2v2 grouping — the lowest-penalty combination among the longest-waiting players. Nothing starts (or counts toward stats) until you tap Start match.</div>
      </Panel>

      {viewing && <ArchivedSessionViewer session={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   MODAL SYSTEM — one consistent look for every dialog in the app: rounded
   corners, a bottom-sheet on mobile / centered card on desktop, backdrop
   fade, Escape-to-close, and large touch-friendly buttons.
--------------------------------------------------------------------------- */
function Modal({ title, icon: Icon, onClose, children, maxWidth = "max-w-md" }) {
  const t = useTheme();
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="op-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 sm:p-4"
      onClick={onClose} role="presentation">
      <div className={`op-modal w-full ${maxWidth} rounded-t-3xl sm:rounded-2xl ${t.panel} p-5 sm:p-6 max-h-[88vh] overflow-y-auto shadow-2xl`}
        onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2 font-semibold text-base">
            {Icon && <Icon size={18} />} {title}
          </div>
          <Btn variant="ghost" onClick={onClose} title="Close" className="!min-h-0 !p-2"><X size={16} /></Btn>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialogHost() {
  const { confirmDialog, closeConfirm } = useStore();
  if (!confirmDialog) return null;
  const { title, message, confirmLabel, tone, onConfirm } = confirmDialog;
  return (
    <Modal title={title} icon={ShieldAlert} onClose={closeConfirm} maxWidth="max-w-sm">
      <p className="text-sm opacity-80 mb-5 leading-relaxed">{message}</p>
      <div className="flex gap-2">
        <Btn variant={tone === "danger" ? "danger" : "yellow"} className="flex-1" onClick={() => { onConfirm(); closeConfirm(); }}>
          {confirmLabel}
        </Btn>
        <Btn variant="ghost" className="flex-1" onClick={closeConfirm}>Cancel</Btn>
      </div>
    </Modal>
  );
}

function SwapPlayerDialogHost() {
  const { state, swapTarget, closeSwap, completeSwap } = useStore();
  const t = useTheme();
  if (!swapTarget) return null;
  const player = state.players.find(p => p.id === swapTarget);
  if (!player) return null;

  const isActive = player.status === "playing";
  let candidates = [];
  if (isActive) {
    const m = state.matches.find(x => x.status === "active" && (x.teamA.includes(player.id) || x.teamB.includes(player.id)));
    const opponentIds = m ? (m.teamA.includes(player.id) ? m.teamB : m.teamA) : [];
    candidates = state.players.filter(p => opponentIds.includes(p.id))
      .map(p => ({ player: p, label: `Opponent on ${m.courtName}` }));
  } else {
    candidates = state.players
      .filter(p => p.id !== player.id && (p.status === "waiting" || p.status === "assigned"))
      .map(p => {
        if (p.status === "waiting") return { player: p, label: "Waiting queue" };
        const m = state.matches.find(x => x.status === "pending" && (x.teamA.includes(p.id) || x.teamB.includes(p.id)));
        return { player: p, label: m ? `Up next · ${m.courtName}` : "Scheduled" };
      });
  }

  return (
    <Modal title={`Swap out ${player.name}`} icon={ArrowRightLeft} onClose={closeSwap}>
      {isActive && (
        <div className={`text-xs mb-3 rounded-lg px-3 py-2 ${t.panelSoft}`}>
          This match is in progress — you can only trade {player.name} with their current opponent, so teammates stay locked in.
        </div>
      )}
      {candidates.length === 0 ? (
        <div className={`text-sm ${t.subtext}`}>No eligible players to swap with right now.</div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto">
          {candidates.map(({ player: c, label }) => (
            <button key={c.id} onClick={() => completeSwap(c.id)}
              className={`flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-left transition ${t.panelSoft} ${t.hover}`}>
              <div>
                <div className="font-medium text-sm">{c.name}</div>
                <div className={`text-xs ${t.subtext}`}>{label}</div>
              </div>
              <ArrowRightLeft size={15} className="opacity-50 shrink-0" />
            </button>
          ))}
        </div>
      )}
      <Btn variant="ghost" className="w-full mt-3" onClick={closeSwap}>Cancel</Btn>
    </Modal>
  );
}

function EndMatchDialogHost() {
  const { state, dispatch, endMatchTarget, closeEndMatch } = useStore();
  const [choice, setChoice] = useState("skip");
  useEffect(() => { setChoice("skip"); }, [endMatchTarget]);
  if (!endMatchTarget) return null;
  const m = endMatchTarget;
  const teamAName = m.teamA.map(id => playerName(state.players, id)).join(" & ");
  const teamBName = m.teamB.map(id => playerName(state.players, id)).join(" & ");

  function confirm() {
    dispatch({ type: "FINISH_MATCH", id: m.id, mode: "no-score", winner: choice === "skip" ? undefined : choice });
    closeEndMatch();
  }

  return (
    <Modal title="End match" icon={Check} onClose={closeEndMatch} maxWidth="max-w-sm">
      <p className="text-sm opacity-80 mb-4 leading-relaxed">
        Would you like to record which team won this match? This is optional and helps maintain player win statistics.
      </p>
      <div className="flex flex-col gap-2 mb-2">
        <ThemedRadioOption checked={choice === "A"} onSelect={() => setChoice("A")} label={`Team A won — ${teamAName}`} />
        <ThemedRadioOption checked={choice === "B"} onSelect={() => setChoice("B")} label={`Team B won — ${teamBName}`} />
        <ThemedRadioOption checked={choice === "skip"} onSelect={() => setChoice("skip")} label="Skip — don't record a winner" />
      </div>
      <div className="flex gap-2 mt-4">
        <Btn variant="yellow" className="flex-1" onClick={confirm}>Confirm</Btn>
        <Btn variant="ghost" className="flex-1" onClick={closeEndMatch}>Cancel</Btn>
      </div>
    </Modal>
  );
}

function ThemedRadioOption({ checked, onSelect, label }) {
  const t = useTheme();
  return (
    <label onClick={onSelect}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 cursor-pointer transition ${t.panelSoft} ${checked ? "ring-2 ring-[#D9F14A]" : ""}`}>
      <input type="radio" readOnly checked={checked} className="h-4 w-4 accent-[#D9F14A]" />
      <span className="text-sm font-medium">{label}</span>
    </label>
  );
}

/* ---------------------------------------------------------------------------
   TOASTS + LOADING SPLASH
--------------------------------------------------------------------------- */
function ToastHost() {
  const { toasts, dismissToast } = useStore();
  const t = useTheme();
  const toneStyle = {
    success: { icon: CheckCircle2, color: GREEN },
    warning: { icon: ShieldAlert, color: CORAL },
    info: { icon: Info, color: BLUE },
  };
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-xs w-[calc(100%-2rem)] sm:w-auto">
      {toasts.map(toast => {
        const cfg = toneStyle[toast.tone] || toneStyle.info;
        const Icon = cfg.icon;
        return (
          <div key={toast.id}
            className={`op-toast flex items-center gap-2 rounded-xl px-3 py-2.5 shadow-lg ${t.panel} text-sm`}
            onClick={() => dismissToast(toast.id)}>
            <Icon size={16} color={cfg.color} className="shrink-0" />
            <span className="flex-1">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

function LoadingSplash() {
  const t = useTheme();
  return (
    <div className={`op-root min-h-screen w-full flex flex-col items-center justify-center gap-3 ${t.page}`}>
      <FontLoader />
      <img src={LOGO_DATA_URI} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-[#D9F14A]" />
      <div className="flex items-center gap-2 text-sm opacity-70">
        <Loader2 size={16} className="op-spin" /> Loading your session…
      </div>
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
      <ToastHost />
      <ConfirmDialogHost />
      <SwapPlayerDialogHost />
      <EndMatchDialogHost />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <header className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <img src={LOGO_DATA_URI} alt="Masters/Besties Open Play logo"
              className="h-11 w-11 sm:h-14 sm:w-14 rounded-full object-cover ring-2 ring-[#D9F14A] shadow-sm shrink-0" />
            <div>
              <div className="op-score text-2xl sm:text-3xl leading-none tracking-wide">MASTERS/BESTIES OPEN PLAY</div>
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

function Gate() {
  const { ready } = useStore();
  return ready ? <AppShell /> : <LoadingSplash />;
}

export default function OpenPlayApp() {
  return (
    <StoreProvider>
      <Gate />
    </StoreProvider>
  );
}

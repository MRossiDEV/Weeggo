"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import { createEmptyFilters, type AppNotification, type Filters, type Mode } from "./types";

export type Locale = "es" | "en";

interface PersistedState {
  mode: Mode;
  filters: Filters;
  liked: string[];
  superliked: string[];
  passed: string[];
  compareSelection: string[];
  notifications: AppNotification[];
  /** Has this visitor completed the landing → wizard onboarding flow at least once? */
  onboarded: boolean;
  /**
   * First name only, given in the wizard for personalization — local to this
   * browser only. Never written to the DB on its own; it only reaches the
   * server if the visitor later submits a real lead (viewing request), which
   * carries its own name field.
   */
  visitorName: string;
  /** Public-app UI language. Defaults to "es" (Uruguay market); "en" is opt-in via the language switcher. Doesn't affect the admin/agent CRM, which stays Spanish-only. */
  locale: Locale;
}

interface DiscoverState extends PersistedState {
  hydrated: boolean;
}

const initialPersistedState: PersistedState = {
  mode: "buy",
  filters: createEmptyFilters(),
  liked: [],
  superliked: [],
  passed: [],
  compareSelection: [],
  notifications: [],
  onboarded: false,
  visitorName: "",
  locale: "es",
};

const initialState: DiscoverState = {
  ...initialPersistedState,
  hydrated: false,
};

type Action =
  | { type: "SET_MODE"; mode: Mode }
  | { type: "SET_FILTERS"; filters: Filters }
  | { type: "LIKE"; id: string }
  | { type: "SUPERLIKE"; id: string }
  | { type: "PASS"; id: string }
  | { type: "TOGGLE_COMPARE"; id: string }
  | { type: "ADD_NOTIFICATION"; message: string }
  | { type: "MARK_NOTIFICATIONS_READ" }
  | { type: "COMPLETE_ONBOARDING" }
  | { type: "SET_VISITOR_NAME"; name: string }
  | { type: "SET_LOCALE"; locale: Locale }
  | { type: "RESET" }
  | { type: "RESET_SEEN" }
  | { type: "HYDRATE"; state: Partial<PersistedState> | null };

/**
 * Fills in any fields missing from `partial` with defaults. Needed because
 * `partial` can come straight from localStorage, which may hold a shape from
 * before a field was added or removed (e.g. an old blob has no
 * `notifications` array at all) — without this, spreading it directly into
 * state produces `undefined` for new fields and crashes the first thing that
 * calls .filter()/.map() on them.
 */
function mergePersistedState(partial: Partial<PersistedState> | null): PersistedState {
  const safe = partial ?? {};
  return {
    mode: safe.mode ?? initialPersistedState.mode,
    filters: { ...initialPersistedState.filters, ...(safe.filters ?? {}) },
    liked: Array.isArray(safe.liked) ? safe.liked : [],
    superliked: Array.isArray(safe.superliked) ? safe.superliked : [],
    passed: Array.isArray(safe.passed) ? safe.passed : [],
    compareSelection: Array.isArray(safe.compareSelection) ? safe.compareSelection : [],
    notifications: Array.isArray(safe.notifications) ? safe.notifications : [],
    onboarded: safe.onboarded ?? initialPersistedState.onboarded,
    visitorName: typeof safe.visitorName === "string" ? safe.visitorName : "",
    locale: safe.locale === "en" ? "en" : "es",
  };
}

function reducer(state: DiscoverState, action: Action): DiscoverState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.mode };

    case "SET_FILTERS":
      return { ...state, filters: action.filters };

    case "LIKE":
      return state.liked.includes(action.id)
        ? state
        : { ...state, liked: [...state.liked, action.id] };

    case "SUPERLIKE":
      return {
        ...state,
        liked: state.liked.includes(action.id) ? state.liked : [...state.liked, action.id],
        superliked: state.superliked.includes(action.id)
          ? state.superliked
          : [...state.superliked, action.id],
      };

    case "PASS":
      return state.passed.includes(action.id)
        ? state
        : { ...state, passed: [...state.passed, action.id] };

    case "TOGGLE_COMPARE": {
      if (state.compareSelection.includes(action.id)) {
        return {
          ...state,
          compareSelection: state.compareSelection.filter((id) => id !== action.id),
        };
      }
      if (state.compareSelection.length >= 3) return state;
      return { ...state, compareSelection: [...state.compareSelection, action.id] };
    }

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [
          { id: crypto.randomUUID(), message: action.message, createdAt: Date.now(), read: false },
          ...state.notifications,
        ].slice(0, 50),
      };

    case "MARK_NOTIFICATIONS_READ":
      return state.notifications.some((n) => !n.read)
        ? { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) }
        : state;

    case "COMPLETE_ONBOARDING":
      return state.onboarded ? state : { ...state, onboarded: true };

    case "SET_VISITOR_NAME":
      return { ...state, visitorName: action.name };

    case "SET_LOCALE":
      return { ...state, locale: action.locale };

    case "RESET":
      // Language is a stickier preference than everything else here — a
      // "start over" on the wizard/filters shouldn't also flip the UI back
      // to the default language.
      return { ...initialPersistedState, locale: state.locale, hydrated: true };

    case "RESET_SEEN":
      // Clears swipe history only — filters, mode, and onboarding stay put,
      // unlike RESET. This is the fix for the deck's empty state: once a
      // visitor has liked/passed every listing that matches their filters,
      // no amount of adjusting filters brings a card back (buildDeck already
      // relaxes every filter to nothing before giving up), so the only real
      // way out is to let them see their swiped listings again.
      return { ...state, liked: [], superliked: [], passed: [], compareSelection: [] };

    case "HYDRATE":
      return { ...mergePersistedState(action.state), hydrated: true };

    default:
      return state;
  }
}

const STORAGE_KEY = "weeggo.discover.v1";

interface DiscoverContextValue extends DiscoverState {
  setMode: (mode: Mode) => void;
  setFilters: (filters: Filters) => void;
  like: (id: string) => void;
  superlike: (id: string) => void;
  pass: (id: string) => void;
  toggleCompare: (id: string) => void;
  addNotification: (message: string) => void;
  markNotificationsRead: () => void;
  unreadNotificationCount: number;
  completeOnboarding: () => void;
  setVisitorName: (name: string) => void;
  setLocale: (locale: Locale) => void;
  reset: () => void;
  resetSeen: () => void;

  // Ephemeral UI state — not persisted, so a page refresh always starts closed.
  activeListingId: string | null;
  openListing: (id: string) => void;
  closeListing: () => void;
  compareOpen: boolean;
  openCompare: () => void;
  closeCompare: () => void;
  filterPanelOpen: boolean;
  openFilterPanel: () => void;
  closeFilterPanel: () => void;
}

const DiscoverContext = createContext<DiscoverContextValue | null>(null);

export function DiscoverProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<PersistedState>) : null;
      dispatch({ type: "HYDRATE", state: parsed });
    } catch {
      // corrupt/unavailable storage — fall through to defaults
      dispatch({ type: "HYDRATE", state: null });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const persisted: PersistedState = {
      mode: state.mode,
      filters: state.filters,
      liked: state.liked,
      superliked: state.superliked,
      passed: state.passed,
      compareSelection: state.compareSelection,
      notifications: state.notifications,
      onboarded: state.onboarded,
      visitorName: state.visitorName,
      locale: state.locale,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  }, [state]);

  const value = useMemo<DiscoverContextValue>(
    () => ({
      ...state,
      setMode: (mode) => dispatch({ type: "SET_MODE", mode }),
      setFilters: (filters) => dispatch({ type: "SET_FILTERS", filters }),
      like: (id) => dispatch({ type: "LIKE", id }),
      superlike: (id) => dispatch({ type: "SUPERLIKE", id }),
      pass: (id) => dispatch({ type: "PASS", id }),
      toggleCompare: (id) => dispatch({ type: "TOGGLE_COMPARE", id }),
      addNotification: (message) => dispatch({ type: "ADD_NOTIFICATION", message }),
      markNotificationsRead: () => dispatch({ type: "MARK_NOTIFICATIONS_READ" }),
      unreadNotificationCount: state.notifications.filter((n) => !n.read).length,
      completeOnboarding: () => dispatch({ type: "COMPLETE_ONBOARDING" }),
      setVisitorName: (name) => dispatch({ type: "SET_VISITOR_NAME", name }),
      setLocale: (locale) => dispatch({ type: "SET_LOCALE", locale }),
      reset: () => dispatch({ type: "RESET" }),
      resetSeen: () => dispatch({ type: "RESET_SEEN" }),

      activeListingId,
      openListing: (id) => setActiveListingId(id),
      closeListing: () => setActiveListingId(null),
      compareOpen,
      openCompare: () => setCompareOpen(true),
      closeCompare: () => setCompareOpen(false),
      filterPanelOpen,
      openFilterPanel: () => setFilterPanelOpen(true),
      closeFilterPanel: () => setFilterPanelOpen(false),
    }),
    [state, activeListingId, compareOpen, filterPanelOpen]
  );

  return <DiscoverContext.Provider value={value}>{children}</DiscoverContext.Provider>;
}

export function useDiscover(): DiscoverContextValue {
  const ctx = useContext(DiscoverContext);
  if (!ctx) throw new Error("useDiscover must be used within a DiscoverProvider");
  return ctx;
}

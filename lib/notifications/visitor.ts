"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "weeggo.visitor.v1";

/**
 * A random id generated once per browser and persisted in localStorage — the
 * "identity" saved searches/push subscriptions attach to. There's no login;
 * this id is an unguessable capability token (122 bits of randomness), the
 * same trust model as the rest of this app's localStorage-only state.
 */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
  } catch {
    // localStorage unavailable — fall through to a fresh, unpersisted id
  }
  const id = crypto.randomUUID();
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // ignore — id just won't survive a reload
  }
  return id;
}

/** Null until mounted (avoids an SSR/client hydration mismatch), then the stable visitor id for this browser. */
export function useVisitorId(): string | null {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    // One-time client-only read (localStorage isn't available during SSR,
    // so this can't be a lazy useState initializer without a hydration
    // mismatch) — same justification as the mount-once effects elsewhere.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setId(getVisitorId());
  }, []);
  return id;
}

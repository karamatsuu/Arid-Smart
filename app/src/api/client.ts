// Data layer — the single place that implements the global stale-data
// contract (spec §0.6): every GET may return { stale: true, as_of: ts }.
// When stale (from the server OR because we fell back to the local cache),
// the app-wide offline banner is raised with as_of as its date.
// Responses are cached in localStorage so no screen ever renders blank.

import { HAS_REAL_API, mockGet, mockMutate } from "./mock";
import type { FieldPayload, TestMessagePayload } from "./types";

export interface StaleState {
  stale: boolean;
  asOf: string | null; // ISO timestamp of the data being shown
}

type Listener = (s: StaleState) => void;

let current: StaleState = { stale: false, asOf: null };
const listeners = new Set<Listener>();

export function getStaleState(): StaleState {
  return current;
}

export function subscribeStale(fn: Listener): () => void {
  listeners.add(fn);
  fn(current);
  return () => listeners.delete(fn);
}

export function setStaleState(s: StaleState) {
  current = s;
  listeners.forEach((fn) => fn(s));
}

const CACHE_PREFIX = "aridsmart:cache:";
const LAST_SYNC_KEY = "aridsmart:lastSync";

interface CacheEntry<T> {
  data: T;
  fetchedAt: string;
}

function readCache<T>(path: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + path);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(path: string, data: T) {
  try {
    const entry: CacheEntry<T> = { data, fetchedAt: new Date().toISOString() };
    localStorage.setItem(CACHE_PREFIX + path, JSON.stringify(entry));
    localStorage.setItem(LAST_SYNC_KEY, entry.fetchedAt);
  } catch {
    /* storage full — serve from network only */
  }
}

export function clearCache() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(CACHE_PREFIX)) localStorage.removeItem(key);
  }
  localStorage.removeItem(LAST_SYNC_KEY);
}

export function lastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export interface ApiResult<T> {
  data: T | null;
  stale: boolean;
  asOf: string | null;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const WRITE_QUEUE_KEY = "aridsmart:writeQueue";

async function fetchJson<T>(path: string): Promise<T> {
  // No backend configured → dev fixtures (same envelope, same pipeline).
  if (!HAS_REAL_API) return mockGet<T>(path);
  const res = await fetch(API_BASE + path, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

type MutationMethod = "POST" | "PUT" | "DELETE";

export interface QueuedMutation {
  id: string;
  method: MutationMethod;
  path: string;
  payload?: FieldPayload | TestMessagePayload;
  queuedAt: string;
}

function readWriteQueue(): QueuedMutation[] {
  try {
    const raw = localStorage.getItem(WRITE_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedMutation[]) : [];
  } catch {
    return [];
  }
}

function writeWriteQueue(items: QueuedMutation[]) {
  try {
    localStorage.setItem(WRITE_QUEUE_KEY, JSON.stringify(items));
  } catch {
    /* best effort only */
  }
}

export function queueMutation(
  method: MutationMethod,
  path: string,
  payload?: FieldPayload | TestMessagePayload,
) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `q-${Date.now()}`;
  writeWriteQueue([
    ...readWriteQueue(),
    { id, method, path, payload, queuedAt: new Date().toISOString() },
  ]);
}

export async function apiMutate<T>(
  method: MutationMethod,
  path: string,
  payload?: FieldPayload | TestMessagePayload,
): Promise<T | null> {
  if (!HAS_REAL_API) {
    const result = await mockMutate<T>(
      method,
      path,
      payload && "area_ha" in payload ? payload : undefined,
    );
    if (path === "/fields" || path.startsWith("/fields/")) {
      try {
        const fields = await mockGet<unknown>("/fields");
        writeCache("/fields", fields);
      } catch {
        /* cache refresh is best effort */
      }
    }
    return result;
  }
  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (res.status === 204) return null;
  return (await res.json()) as T;
}

/**
 * GET with the stale contract. The backend envelope is
 * `{ stale?: boolean, as_of?: string, ...payload }` — when `stale` is true,
 * or when the network fails and we serve the cache, the global banner fires.
 */
export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const json = (await fetchJson<T>(path)) as T & {
      stale?: boolean;
      as_of?: string;
    };
    writeCache(path, json);
    if (json.stale) {
      setStaleState({ stale: true, asOf: json.as_of ?? null });
      return { data: json, stale: true, asOf: json.as_of ?? null };
    }
    setStaleState({ stale: false, asOf: null });
    return { data: json, stale: false, asOf: null };
  } catch {
    const cached = readCache<T>(path);
    const asOf = cached?.fetchedAt ?? lastSyncTime();
    setStaleState({ stale: true, asOf });
    return { data: cached?.data ?? null, stale: true, asOf };
  }
}

// Browser connectivity is a second trigger for the same banner: going
// offline immediately marks whatever is on screen as cached data.
export function initConnectivityWatch() {
  window.addEventListener("offline", () =>
    setStaleState({ stale: true, asOf: lastSyncTime() }),
  );
  window.addEventListener("online", () => {
    // banner clears on the next successful GET; optimistically clear if we
    // were only offline-flagged (no server-declared staleness pending)
    setStaleState({ stale: false, asOf: null });
  });
  if (!navigator.onLine) {
    setStaleState({ stale: true, asOf: lastSyncTime() });
  }
}

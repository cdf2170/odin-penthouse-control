// Tracks the most-recently activated scene per room.
// HA scenes are stateless triggers, so we keep our own client-side memory.
// A scene is considered "active" until the user manually changes a light
// in that room (which breaks the scene), or 4 hours pass.

import { useEffect, useState } from "react";

type ActiveScene = {
  room: string;
  sceneEntity: string;
  sceneName: string;
  activatedAt: number;
};

const STORAGE_KEY = "odin.active_scenes.v1";
const TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

type Store = Record<string, ActiveScene>; // keyed by room name
const listeners = new Set<() => void>();
let store: Store = load();

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    // Prune expired
    const now = Date.now();
    const cleaned: Store = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (now - v.activatedAt < TTL_MS) cleaned[k] = v;
    }
    return cleaned;
  } catch {
    return {};
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {}
  listeners.forEach((l) => l());
}

export function setActiveScene(room: string, sceneEntity: string, sceneName: string) {
  store = {
    ...store,
    [room]: { room, sceneEntity, sceneName, activatedAt: Date.now() },
  };
  persist();
}

export function clearActiveScene(room: string) {
  if (!store[room]) return;
  const { [room]: _, ...rest } = store;
  store = rest;
  persist();
}

export function getActiveScene(room: string): ActiveScene | undefined {
  const entry = store[room];
  if (!entry) return undefined;
  if (Date.now() - entry.activatedAt > TTL_MS) {
    clearActiveScene(room);
    return undefined;
  }
  return entry;
}

export function useActiveScene(room: string): ActiveScene | undefined {
  const [, tick] = useState(0);
  useEffect(() => {
    const cb = () => tick((n) => n + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
  return getActiveScene(room);
}

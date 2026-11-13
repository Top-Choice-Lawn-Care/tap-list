"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { parseTapData, serializeTapData, STORAGE_KEY } from "@/lib/taps";
import type { TapData, TapEntry } from "@/lib/types";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emptySubscribe() {
  return () => {};
}

function readTapRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parseStored(raw: string): TapData {
  if (!raw) return {};
  try {
    return parseTapData(raw);
  } catch {
    return {};
  }
}

/** Write taps. Leaves an existing payload untouched when the parsed log is unchanged. */
export function persistTapData(data: TapData) {
  const next = serializeTapData(data);
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) {
      try {
        if (serializeTapData(parseTapData(current)) === next) {
          emit();
          return;
        }
      } catch {
        // Unreadable payload stays put unless there is something new to save.
        if (next === "{}") {
          emit();
          return;
        }
      }
    } else if (next === "{}") {
      emit();
      return;
    }
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode or a full disk: keep the in-memory log for this render only.
  }
  emit();
}

/**
 * Tap log backed by localStorage key `tap-list-data`.
 * Server and hydration render an empty log; the stored value is read on the client
 * after hydration so existing entries show without a storage rewrite.
 */
export function useTapLog() {
  const raw = useSyncExternalStore(subscribe, readTapRaw, () => "");
  const hydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const tapData = useMemo(() => parseStored(raw), [raw]);

  const addTap = useCallback((submissionName: string, date: string, note: string) => {
    const current = parseStored(readTapRaw());
    const existing = current[submissionName] ?? [];
    persistTapData({ ...current, [submissionName]: [...existing, { date, note }] });
  }, []);

  const deleteTap = useCallback((submissionName: string, index: number): TapEntry | null => {
    const current = parseStored(readTapRaw());
    const existing = current[submissionName] ?? [];
    const removed = existing[index] ?? null;
    const updated = existing.filter((_, i) => i !== index);
    const next = { ...current };
    if (updated.length === 0) delete next[submissionName];
    else next[submissionName] = updated;
    persistTapData(next);
    return removed;
  }, []);

  const replaceTapData = useCallback((data: TapData) => {
    persistTapData(data);
  }, []);

  return { tapData, hydrated, addTap, deleteTap, replaceTapData };
}

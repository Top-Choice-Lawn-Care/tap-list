import type { TapData, TapEntry } from "./types";

/**
 * On-device tap log. Existing installs already use this key and shape:
 * `{ [submissionName]: [{ date, note }] }`. Do not rename the key or drop entries.
 * `jj-streak-data` may still exist from older builds; leave it alone.
 */
export const STORAGE_KEY = "tap-list-data";

function normalizeEntry(item: unknown): TapEntry | null {
  if (typeof item === "string" && item.trim().length > 0) {
    return { date: item, note: "" };
  }
  if (!item || typeof item !== "object") return null;
  const record = item as Record<string, unknown>;
  if (typeof record.date !== "string" || record.date.length === 0) return null;
  return {
    date: record.date,
    note: typeof record.note === "string" ? record.note : "",
  };
}

/** Parse stored taps. Invalid JSON throws so the caller can refuse to overwrite it. */
export function parseTapData(raw: string): TapData {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const data: TapData = {};
  for (const [name, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    const entries: TapEntry[] = [];
    for (const item of value) {
      const entry = normalizeEntry(item);
      if (entry) entries.push(entry);
    }
    if (entries.length > 0) data[name] = entries;
  }
  return data;
}

export function serializeTapData(data: TapData): string {
  return JSON.stringify(data);
}

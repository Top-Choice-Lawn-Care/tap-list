"use client";

import { useState } from "react";
import { T } from "@/lib/theme";
import type { TapEntry } from "@/lib/types";

function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function LogTapModal({
  submissionName,
  entries,
  onClose,
  onConfirm,
  onDelete,
}: {
  submissionName: string | null;
  entries: TapEntry[];
  onClose: () => void;
  onConfirm: (date: string, note: string) => void;
  onDelete: (index: number) => void;
}) {
  if (!submissionName) return null;
  return (
    <LogTapForm
      key={submissionName}
      submissionName={submissionName}
      entries={entries}
      onClose={onClose}
      onConfirm={onConfirm}
      onDelete={onDelete}
    />
  );
}

function LogTapForm({
  submissionName,
  entries,
  onClose,
  onConfirm,
  onDelete,
}: {
  submissionName: string;
  entries: TapEntry[];
  onClose: () => void;
  onConfirm: (date: string, note: string) => void;
  onDelete: (index: number) => void;
}) {
  const [date, setDate] = useState(todayDate);
  const [note, setNote] = useState("");

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.82)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: "16px", backdropFilter: "blur(6px)",
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: T.modal, border: `1px solid ${T.borderDefault}`,
        borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "360px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
      }}>
        <h2 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 800, color: T.textPrimary }}>
          Log a tap
        </h2>
        <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: T.red, fontWeight: 700 }}>{submissionName}</p>

        {entries.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Logged taps
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px", maxHeight: "120px", overflowY: "auto" }}>
              {entries.map((entry, i) => (
                <div key={`${entry.date}-${i}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  backgroundColor: T.surface, border: `1px solid ${T.borderSubtle}`,
                  borderRadius: "8px", padding: "6px 10px",
                }}>
                  <div>
                    <span style={{ fontSize: "13px", color: T.textPrimary, fontWeight: 600 }}>{entry.date}</span>
                    {entry.note && <span style={{ fontSize: "11px", color: T.textTertiary, marginLeft: "8px" }}>{entry.note}</span>}
                  </div>
                  <button
                    onClick={() => onDelete(i)}
                    style={{
                      background: "none", border: "none", color: "#6b7280",
                      fontSize: "16px", cursor: "pointer", padding: "2px 6px",
                      lineHeight: 1, borderRadius: "4px", flexShrink: 0,
                      fontFamily: "inherit",
                    }}
                    title="Remove this tap"
                    aria-label={`Remove tap on ${entry.date}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.textTertiary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
          Date
        </label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          style={{
            width: "100%", backgroundColor: T.surface, border: `1px solid ${T.borderDefault}`,
            borderRadius: "8px", padding: "9px 10px", color: T.textPrimary,
            fontSize: "14px", marginBottom: "16px", fontFamily: "inherit", boxSizing: "border-box",
          }} />
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.textTertiary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
          Note (optional)
        </label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)}
          placeholder="How'd you get it? From guard? Fast tap?"
          rows={3}
          style={{
            width: "100%", backgroundColor: T.surface, border: `1px solid ${T.borderDefault}`,
            borderRadius: "8px", padding: "9px 10px", color: T.textPrimary,
            fontSize: "14px", fontFamily: "inherit", resize: "none",
            marginBottom: "20px", boxSizing: "border-box",
          }} />
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onClose} style={{
            flex: 1, backgroundColor: T.surface, color: T.textTertiary,
            border: `1px solid ${T.borderDefault}`, borderRadius: "10px",
            padding: "13px", fontSize: "15px", fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", WebkitTapHighlightColor: "transparent",
          }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(date, note)} style={{
            flex: 2, background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            color: "#fff", border: "none", borderRadius: "10px",
            padding: "13px", fontSize: "15px", fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 0 20px rgba(220,38,38,0.4)", WebkitTapHighlightColor: "transparent",
          }}>
            Confirm Tap
          </button>
        </div>
      </div>
    </div>
  );
}

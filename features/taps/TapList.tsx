"use client";

import { useState } from "react";
import { CATEGORIES, DIFFICULTY_DOT, SUBMISSIONS } from "@/lib/submissions";
import { T } from "@/lib/theme";
import type { TapData } from "@/lib/types";

export default function TapList({
  tapData,
  onOpen,
  onOpenVideo,
}: {
  tapData: TapData;
  onOpen: (name: string) => void;
  onOpenVideo: (name: string) => void;
}) {
  const [shareMsg, setShareMsg] = useState("");
  const totalCollected = SUBMISSIONS.filter((sub) => (tapData[sub.name]?.length ?? 0) > 0).length;
  const totalTaps = Object.values(tapData).reduce((sum, entries) => sum + entries.length, 0);
  const progressPct = Math.round((totalCollected / SUBMISSIONS.length) * 100);

  function handleShare() {
    let topMove = "none";
    let topCount = 0;
    for (const [name, entries] of Object.entries(tapData)) {
      if (entries.length > topCount) {
        topCount = entries.length;
        topMove = name;
      }
    }
    const text = totalCollected === 0
      ? "Just started tracking on JJ Game Plan."
      : `${totalCollected}/${SUBMISSIONS.length} submissions on JJ Game Plan (${progressPct}%). Top move: ${topMove} ×${topCount}.`;
    setShareMsg(text);
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    setTimeout(() => setShareMsg(""), 4000);
  }

  return (
    <>
      <div style={{
        padding: "14px 16px",
        borderBottom: `1px solid ${T.borderSubtle}`,
        display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
            <span style={{ color: T.red, fontWeight: 700, fontSize: "15px" }}>
              {totalCollected}<span style={{ color: T.textTertiary, fontSize: "13px", fontWeight: 400 }}>/{SUBMISSIONS.length}</span>
            </span>
            <span style={{ color: T.textTertiary, fontSize: "12px" }}>
              {totalTaps} tap{totalTaps !== 1 ? "s" : ""} logged
            </span>
            <span style={{ color: T.textDisabled, fontSize: "12px", marginLeft: "auto" }}>{progressPct}%</span>
          </div>
          <div style={{
            height: "4px", backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: "2px", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${T.red}, #ef4444)`,
              borderRadius: "2px", transition: "width 0.5s ease",
              boxShadow: "0 0 8px rgba(220,38,38,0.5)",
            }} />
          </div>
        </div>

        <button onClick={handleShare} style={{
          backgroundColor: T.elevated, color: T.textPrimary,
          border: `1px solid ${T.borderDefault}`, borderRadius: "8px",
          padding: "8px 14px", fontSize: "13px", fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: "6px",
          flexShrink: 0, transition: "all 0.15s ease",
          WebkitTapHighlightColor: "transparent",
        }}>
          Share
        </button>
      </div>

      {shareMsg && (
        <div style={{
          margin: "8px 16px",
          backgroundColor: T.elevated, border: `1px solid ${T.borderDefault}`,
          borderLeft: `3px solid ${T.green}`, borderRadius: "8px",
          padding: "10px 12px", fontSize: "13px", color: T.textSecondary, lineHeight: 1.5,
        }}>
          Copied to clipboard
        </div>
      )}

      {totalCollected === 0 && (
        <div style={{
          margin: "32px 16px 8px", padding: "40px 24px",
          backgroundColor: T.surface, border: `1px solid ${T.borderSubtle}`,
          borderRadius: "16px", textAlign: "center",
        }}>
          <div style={{ fontSize: "56px", marginBottom: "16px", opacity: 0.3, filter: "grayscale(0.5)" }}>🥋</div>
          <div style={{ fontSize: "18px", fontWeight: 800, color: T.textPrimary, marginBottom: "8px" }}>
            No taps logged yet
          </div>
          <div style={{ fontSize: "14px", color: T.textTertiary, lineHeight: 1.7 }}>
            Tap any submission below to log one.
            <br />
            <span style={{ color: T.textDisabled }}>{SUBMISSIONS.length} techniques in the list. Your log stays on this device.</span>
          </div>
        </div>
      )}

      <div style={{ padding: "0 16px 24px" }}>
        {CATEGORIES.map((category) => {
          const subs = SUBMISSIONS.filter((sub) => sub.category === category);
          const catCollected = subs.filter((sub) => (tapData[sub.name]?.length ?? 0) > 0).length;
          return (
            <div key={category}>
              <div style={{
                padding: "20px 0 8px", display: "flex", alignItems: "baseline", gap: "8px",
              }}>
                <span style={{
                  fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px",
                  color: T.textDisabled, textTransform: "uppercase",
                }}>
                  {category}
                </span>
                <span style={{ fontSize: "11px", color: T.textDisabled, opacity: 0.7 }}>
                  {catCollected}/{subs.length}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }} className="submissions-grid">
                {subs.map((sub) => {
                  const count = tapData[sub.name]?.length ?? 0;
                  const collected = count > 0;
                  return (
                    <div key={sub.name} onClick={() => onOpen(sub.name)}
                      style={{
                        backgroundColor: collected ? "#161620" : T.surface,
                        border: `1px solid ${collected ? T.borderDefault : T.borderSubtle}`,
                        borderLeft: collected ? `3px solid ${T.red}` : `1px solid ${T.borderSubtle}`,
                        borderRadius: "10px", padding: "12px 12px 10px",
                        cursor: "pointer", position: "relative",
                        boxShadow: collected ? "0 0 0 1px rgba(220,38,38,0.08), 0 2px 12px rgba(0,0,0,0.4)" : "none",
                        transition: "all 0.15s ease",
                        userSelect: "none", WebkitTapHighlightColor: "transparent",
                        minHeight: "76px", display: "flex", flexDirection: "column",
                        justifyContent: "space-between",
                      }}>
                      {collected && (
                        <div style={{
                          position: "absolute", top: "8px", right: "8px",
                          backgroundColor: T.red, color: "#fff",
                          borderRadius: "10px", padding: "1px 7px",
                          fontSize: "11px", fontWeight: 700, lineHeight: "18px",
                        }}>
                          ×{count}
                        </div>
                      )}
                      <div style={{
                        fontSize: "13px", fontWeight: 600,
                        color: collected ? T.textPrimary : T.textSecondary,
                        lineHeight: "1.35", paddingRight: collected ? "28px" : "0",
                      }}>
                        {sub.name}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                        <div title={DIFFICULTY_DOT[sub.difficulty].label} style={{
                          width: 8, height: 8, borderRadius: "50%",
                          backgroundColor: DIFFICULTY_DOT[sub.difficulty].color,
                          boxShadow: `0 0 5px ${DIFFICULTY_DOT[sub.difficulty].color}99`,
                          flexShrink: 0,
                        }} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenVideo(sub.name);
                          }}
                          style={{
                            background: "none", border: "none", padding: "4px",
                            fontSize: "15px", opacity: 0.65, cursor: "pointer",
                            lineHeight: 1, WebkitTapHighlightColor: "transparent",
                            borderRadius: "4px",
                          }}
                          title={`Watch ${sub.name} tutorial`}
                          aria-label={`Watch ${sub.name} tutorial`}
                        >
                          🎥
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const GamePlanFlow = dynamic(() => import("./components/GamePlanFlow"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6b7280", fontSize: "14px" }}>
      Loading game plan…
    </div>
  ),
});

// ─── Tap List Types & Data ───────────────────────────────────────────────────

type TapEntry = {
  date: string;
  note: string;
};

type TapData = {
  [submissionName: string]: TapEntry[];
};

type Submission = {
  name: string;
  category: string;
};

const SUBMISSIONS: Submission[] = [
  // Chokes
  { name: "Rear Naked Choke", category: "Chokes" },
  { name: "Guillotine (High Elbow)", category: "Chokes" },
  { name: "Arm-In Guillotine", category: "Chokes" },
  { name: "Triangle Choke", category: "Chokes" },
  { name: "D'Arce Choke", category: "Chokes" },
  { name: "Anaconda Choke", category: "Chokes" },
  { name: "North-South Choke", category: "Chokes" },
  { name: "Bow and Arrow Choke", category: "Chokes" },
  { name: "Ezekiel Choke", category: "Chokes" },
  { name: "Loop Choke", category: "Chokes" },
  { name: "Clock Choke", category: "Chokes" },
  { name: "Cross Collar Choke", category: "Chokes" },
  // Arm Locks
  { name: "Armbar", category: "Arm Locks" },
  { name: "Kimura", category: "Arm Locks" },
  { name: "Americana", category: "Arm Locks" },
  { name: "Omoplata", category: "Arm Locks" },
  { name: "Wristlock", category: "Arm Locks" },
  { name: "Baratoplata", category: "Arm Locks" },
  // Leg Locks
  { name: "Straight Ankle Lock", category: "Leg Locks" },
  { name: "Inside Heel Hook", category: "Leg Locks" },
  { name: "Outside Heel Hook", category: "Leg Locks" },
  { name: "Kneebar", category: "Leg Locks" },
  { name: "Calf Slicer", category: "Leg Locks" },
  { name: "Toe Hold", category: "Leg Locks" },
  // Specialty
  { name: "Gogoplata", category: "Specialty" },
  { name: "Peruvian Necktie", category: "Specialty" },
  { name: "Twister", category: "Specialty" },
  { name: "Buggy Choke", category: "Specialty" },
  { name: "Banana Split", category: "Specialty" },
];

const CATEGORIES = ["Chokes", "Arm Locks", "Leg Locks", "Specialty"];

const STORAGE_KEY = "tap-list-data";

function getTodayDate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Flow Tab Types & Data ───────────────────────────────────────────────────

type OptionType = "submission" | "sweep" | "escape" | "transition" | "takedown";

type FlowOption = {
  name: string;
  type: OptionType;
};

type FlowPosition = {
  id: string;
  label: string;
  emoji: string;
  options: FlowOption[];
};

// Unified color system — same values used in Flow tab, Game Plan tab, and Tap List accent
const TYPE_COLORS: Record<OptionType, string> = {
  submission: "#dc2626",
  sweep:      "#2563eb",
  escape:     "#16a34a",
  transition: "#7c3aed",
  takedown:   "#7c3aed",
};

const TYPE_LABELS: Record<OptionType, string> = {
  submission: "Submission",
  sweep:      "Sweep",
  escape:     "Escape",
  transition: "Transition",
  takedown:   "Takedown",
};

// Semantic background surfaces for each type
const TYPE_SURFACES: Record<OptionType, string> = {
  submission: "rgba(220,38,38,0.10)",
  sweep:      "rgba(37,99,235,0.10)",
  escape:     "rgba(22,163,74,0.10)",
  transition: "rgba(124,58,237,0.10)",
  takedown:   "rgba(124,58,237,0.10)",
};

const FLOW_POSITIONS: FlowPosition[] = [
  {
    id: "closed-guard-bottom",
    label: "Closed Guard (bottom)",
    emoji: "🔒",
    options: [
      { name: "Triangle Choke", type: "submission" },
      { name: "Armbar", type: "submission" },
      { name: "Kimura", type: "submission" },
      { name: "Hip Bump Sweep → Mount", type: "sweep" },
      { name: "Scissor Sweep → Mount", type: "sweep" },
    ],
  },
  {
    id: "open-guard-bottom",
    label: "Open Guard (bottom)",
    emoji: "🕸️",
    options: [
      { name: "Spider Guard → Triangle", type: "submission" },
      { name: "De La Riva → Back Take", type: "transition" },
      { name: "Lasso Guard → Omoplata", type: "submission" },
      { name: "Sit-Up Guard → Single Leg", type: "takedown" },
    ],
  },
  {
    id: "half-guard-bottom",
    label: "Half Guard (bottom)",
    emoji: "↔️",
    options: [
      { name: "Deep Half → Homer Simpson Sweep", type: "sweep" },
      { name: "Kimura", type: "submission" },
      { name: "Take the Back", type: "transition" },
      { name: "Dogfight → Back Take", type: "transition" },
    ],
  },
  {
    id: "mount-top",
    label: "Mount (top)",
    emoji: "👑",
    options: [
      { name: "Armbar", type: "submission" },
      { name: "Americana", type: "submission" },
      { name: "Ezekiel Choke", type: "submission" },
      { name: "Take the Back → RNC", type: "transition" },
      { name: "S-Mount → Armbar", type: "submission" },
    ],
  },
  {
    id: "mount-bottom",
    label: "Mount (bottom — escaping)",
    emoji: "⬇️",
    options: [
      { name: "Elbow-Knee Escape → Guard", type: "escape" },
      { name: "Upa Bridge & Roll → Guard", type: "escape" },
      { name: "Take the Back", type: "transition" },
    ],
  },
  {
    id: "back-mount",
    label: "Back Mount (attacking)",
    emoji: "🎯",
    options: [
      { name: "Rear Naked Choke", type: "submission" },
      { name: "Bow & Arrow Choke", type: "submission" },
      { name: "Armbar from Back", type: "submission" },
      { name: "Collar Choke", type: "submission" },
    ],
  },
  {
    id: "side-control-top",
    label: "Side Control (top)",
    emoji: "🔝",
    options: [
      { name: "Americana", type: "submission" },
      { name: "Kimura", type: "submission" },
      { name: "North-South Choke", type: "submission" },
      { name: "Take Mount", type: "transition" },
      { name: "Darce Choke", type: "submission" },
    ],
  },
  {
    id: "side-control-bottom",
    label: "Side Control (bottom — escaping)",
    emoji: "🚪",
    options: [
      { name: "Shrimp to Guard", type: "escape" },
      { name: "Granby Roll", type: "escape" },
      { name: "Underhook → Knees", type: "escape" },
    ],
  },
  {
    id: "turtle",
    label: "Turtle (defending)",
    emoji: "🐢",
    options: [
      { name: "Granby Roll", type: "escape" },
      { name: "Stand Up", type: "escape" },
      { name: "Sit Out", type: "escape" },
      { name: "Back Take Defense", type: "escape" },
    ],
  },
  {
    id: "standing",
    label: "Standing",
    emoji: "🧍",
    options: [
      { name: "Double Leg Takedown", type: "takedown" },
      { name: "Single Leg Takedown", type: "takedown" },
      { name: "Hip Throw (O-Goshi)", type: "takedown" },
      { name: "Guard Pull", type: "transition" },
      { name: "Snap Down → Guillotine", type: "submission" },
    ],
  },
];

// ─── Design Tokens ───────────────────────────────────────────────────────────

const T = {
  // Elevation layers — slightly purple-tinted for that premium dark feel
  bg:       "#09090d",
  surface:  "#131318",
  elevated: "#1c1c24",
  modal:    "#232329",

  // Borders — low opacity white
  borderSubtle:  "rgba(255,255,255,0.06)",
  borderDefault: "rgba(255,255,255,0.09)",
  borderStrong:  "rgba(255,255,255,0.14)",

  // Text
  textPrimary:   "#e8e8ea",
  textSecondary: "#9ca3af",
  textTertiary:  "#6b7280",
  textDisabled:  "#4b5563",

  // Semantic accents
  red:    "#dc2626",
  blue:   "#2563eb",
  green:  "#16a34a",
  purple: "#7c3aed",
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab] = useState<"taplist" | "flow" | "gameplan">("taplist");

  // Tap List state
  const [tapData, setTapData] = useState<TapData>({});
  const [modalSub, setModalSub] = useState<string | null>(null);
  const [modalDate, setModalDate] = useState<string>(getTodayDate());
  const [modalNote, setModalNote] = useState<string>("");
  const [shareMsg, setShareMsg] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  // Flow state
  const [selectedPosition, setSelectedPosition] = useState<FlowPosition | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTapData(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(tapData));
  }, [tapData, hydrated]);

  const totalCollected = SUBMISSIONS.filter((s) => (tapData[s.name]?.length ?? 0) > 0).length;
  const totalTaps = Object.values(tapData).reduce((sum, entries) => sum + entries.length, 0);
  const progressPct = Math.round((totalCollected / SUBMISSIONS.length) * 100);

  function openModal(name: string) {
    setModalSub(name);
    setModalDate(getTodayDate());
    setModalNote("");
  }

  function closeModal() {
    setModalSub(null);
    setModalNote("");
  }

  function confirmTap() {
    if (!modalSub) return;
    setTapData((prev) => {
      const existing = prev[modalSub] ?? [];
      return { ...prev, [modalSub]: [...existing, { date: modalDate, note: modalNote }] };
    });
    closeModal();
  }

  function handleShare() {
    let topMove = "none";
    let topCount = 0;
    for (const [name, entries] of Object.entries(tapData)) {
      if (entries.length > topCount) { topCount = entries.length; topMove = name; }
    }
    const text =
      totalCollected === 0
        ? "I'm just getting started on Jiu Jitsu Tap List. 🥋"
        : `🥋 ${totalCollected}/${SUBMISSIONS.length} submissions collected on Jiu Jitsu Tap List (${progressPct}%). My most caught: ${topMove} ×${topCount}.`;

    setShareMsg(text);
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    setTimeout(() => setShareMsg(""), 4000);
  }

  function youtubeUrl(name: string): string {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(`bjj ${name} tutorial`)}`;
  }

  if (!hydrated) return null;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: T.bg,
      color: T.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: "0 0 80px 0",
    }}>

      {/* ── Sticky Header ── */}
      <div style={{
        padding: "20px 16px 12px",
        borderBottom: `1px solid ${T.borderSubtle}`,
        position: "sticky",
        top: 0,
        backgroundColor: T.bg,
        zIndex: 10,
        backdropFilter: "blur(12px)",
      }}>
        <h1 style={{
          margin: "0 0 14px 0",
          fontSize: "22px",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          color: T.textPrimary,
        }}>
          🥋 Jiu Jitsu Tap List
        </h1>

        {/* ── Pill Tab Bar ── */}
        <div style={{
          display: "flex",
          gap: "2px",
          backgroundColor: "rgba(255,255,255,0.05)",
          padding: "3px",
          borderRadius: "10px",
          border: `1px solid ${T.borderSubtle}`,
        }}>
          {(["taplist", "flow", "gameplan"] as const).map((tab) => {
            const labels = { taplist: "🥋 Tap List", flow: "🗺️ Flow", gameplan: "🔗 Game Plan" };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); if (tab === "flow") setSelectedPosition(null); }}
                style={{
                  flex: 1,
                  padding: "8px 8px",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: isActive ? T.elevated : "transparent",
                  color: isActive ? T.textPrimary : T.textTertiary,
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
                  WebkitTapHighlightColor: "transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TAP LIST TAB
      ══════════════════════════════════════════ */}
      {activeTab === "taplist" && (
        <>
          {/* Stats + Share bar */}
          <div style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${T.borderSubtle}`,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}>
            {/* Progress block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                <span style={{ color: T.red, fontWeight: 700, fontSize: "15px" }}>
                  {totalCollected}<span style={{ color: T.textTertiary, fontSize: "13px", fontWeight: 400 }}>/{SUBMISSIONS.length}</span>
                </span>
                <span style={{ color: T.textTertiary, fontSize: "12px" }}>
                  {totalTaps} tap{totalTaps !== 1 ? "s" : ""} logged
                </span>
                <span style={{ color: T.textDisabled, fontSize: "12px", marginLeft: "auto" }}>
                  {progressPct}%
                </span>
              </div>
              {/* Progress bar */}
              <div style={{
                height: "3px",
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: "2px",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  backgroundColor: T.red,
                  borderRadius: "2px",
                  transition: "width 0.4s ease",
                  boxShadow: "0 0 6px rgba(220,38,38,0.6)",
                }} />
              </div>
            </div>

            {/* Share button — prominent */}
            <button
              onClick={handleShare}
              style={{
                backgroundColor: T.elevated,
                color: T.textPrimary,
                border: `1px solid ${T.borderDefault}`,
                borderRadius: "8px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexShrink: 0,
                transition: "all 0.15s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Share <span style={{ fontSize: "14px" }}>📤</span>
            </button>
          </div>

          {/* Share confirmation */}
          {shareMsg && (
            <div style={{
              margin: "8px 16px",
              backgroundColor: T.elevated,
              border: `1px solid ${T.borderDefault}`,
              borderLeft: `3px solid ${T.green}`,
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "13px",
              color: T.textSecondary,
              lineHeight: 1.5,
            }}>
              ✓ Copied to clipboard
            </div>
          )}

          {/* Empty state — only when nothing collected yet */}
          {totalCollected === 0 && (
            <div style={{
              margin: "32px 16px 8px",
              padding: "32px 24px",
              backgroundColor: T.surface,
              border: `1px solid ${T.borderSubtle}`,
              borderRadius: "12px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.4 }}>🥋</div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: T.textPrimary, marginBottom: "6px" }}>
                No taps logged yet
              </div>
              <div style={{ fontSize: "14px", color: T.textTertiary, lineHeight: 1.6 }}>
                Tap any submission below to log your first one.<br />
                {SUBMISSIONS.length} moves to collect.
              </div>
            </div>
          )}

          {/* Submission grid */}
          <div style={{ padding: "0 16px" }}>
            {CATEGORIES.map((category) => {
              const subs = SUBMISSIONS.filter((s) => s.category === category);
              const categoryCollected = subs.filter((s) => (tapData[s.name]?.length ?? 0) > 0).length;
              return (
                <div key={category}>
                  <div style={{
                    padding: "20px 0 8px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                  }}>
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      color: T.textDisabled,
                      textTransform: "uppercase",
                    }}>
                      {category}
                    </span>
                    <span style={{ fontSize: "11px", color: T.textDisabled, opacity: 0.7 }}>
                      {categoryCollected}/{subs.length}
                    </span>
                  </div>

                  <div
                    style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}
                    className="submissions-grid"
                  >
                    {subs.map((sub) => {
                      const taps = tapData[sub.name] ?? [];
                      const count = taps.length;
                      const collected = count > 0;

                      return (
                        <div
                          key={sub.name}
                          onClick={() => openModal(sub.name)}
                          style={{
                            backgroundColor: collected ? T.surface : T.surface,
                            border: `1px solid ${collected ? T.borderDefault : T.borderSubtle}`,
                            borderLeft: collected ? `3px solid ${T.red}` : `1px solid ${T.borderSubtle}`,
                            borderRadius: "10px",
                            padding: "12px 12px 10px",
                            cursor: "pointer",
                            position: "relative",
                            boxShadow: collected ? `0 0 0 1px rgba(220,38,38,0.08), 0 2px 8px rgba(0,0,0,0.35)` : "none",
                            transition: "all 0.15s ease",
                            userSelect: "none",
                            WebkitTapHighlightColor: "transparent",
                            minHeight: "72px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            opacity: 1,
                          }}
                        >
                          {collected && (
                            <div style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              backgroundColor: T.red,
                              color: "#fff",
                              borderRadius: "10px",
                              padding: "1px 7px",
                              fontSize: "11px",
                              fontWeight: 700,
                              lineHeight: "18px",
                            }}>
                              ×{count}
                            </div>
                          )}

                          <div style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: T.textPrimary,
                            lineHeight: "1.35",
                            paddingRight: collected ? "28px" : "0",
                          }}>
                            {sub.name}
                          </div>

                          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                            <a
                              href={youtubeUrl(sub.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{ fontSize: "15px", opacity: 0.7, textDecoration: "none", lineHeight: 1 }}
                              title={`Watch ${sub.name} tutorial`}
                            >
                              🎥
                            </a>
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
      )}

      {/* ══════════════════════════════════════════
          FLOW TAB
      ══════════════════════════════════════════ */}
      {activeTab === "flow" && (
        <div style={{ padding: "0 16px" }}>
          {!selectedPosition ? (
            <>
              <div style={{
                padding: "16px 0 10px",
                fontSize: "13px",
                color: T.textTertiary,
                lineHeight: "1.5",
              }}>
                Where are you on the mat? Pick a position to see your options.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "16px" }}>
                {FLOW_POSITIONS.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos)}
                    style={{
                      backgroundColor: T.surface,
                      border: `1px solid ${T.borderSubtle}`,
                      borderRadius: "10px",
                      padding: "14px 16px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s ease",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span style={{ fontSize: "26px", lineHeight: 1, flexShrink: 0 }}>{pos.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: T.textPrimary }}>
                        {pos.label}
                      </div>
                      <div style={{ fontSize: "12px", color: T.textTertiary, marginTop: "2px" }}>
                        {pos.options.length} options
                      </div>
                    </div>
                    <span style={{ color: T.textDisabled, fontSize: "18px", flexShrink: 0 }}>›</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ padding: "14px 0 0" }}>
                <button
                  onClick={() => setSelectedPosition(null)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: T.purple,
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    padding: "0 0 12px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  ‹ All Positions
                </button>

                <div style={{
                  backgroundColor: T.surface,
                  border: `1px solid ${T.borderSubtle}`,
                  borderLeft: `3px solid ${T.purple}`,
                  borderRadius: "10px",
                  padding: "14px 16px",
                  marginBottom: "12px",
                  boxShadow: `0 0 0 1px rgba(124,58,237,0.08)`,
                }}>
                  <div style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "1.5px",
                    color: T.purple,
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}>
                    You are here
                  </div>
                  <div style={{
                    fontSize: "19px",
                    fontWeight: 800,
                    color: T.textPrimary,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                    <span>{selectedPosition.emoji}</span>
                    <span>{selectedPosition.label}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "16px" }}>
                {selectedPosition.options.map((opt, i) => {
                  const color = TYPE_COLORS[opt.type];
                  const label = TYPE_LABELS[opt.type];
                  const surface = TYPE_SURFACES[opt.type];
                  return (
                    <div
                      key={i}
                      style={{
                        backgroundColor: T.surface,
                        border: `1px solid ${T.borderSubtle}`,
                        borderLeft: `3px solid ${color}`,
                        borderRadius: "10px",
                        padding: "14px 14px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: T.textPrimary, lineHeight: "1.35" }}>
                          {opt.name}
                        </div>
                        <div style={{
                          display: "inline-block",
                          marginTop: "5px",
                          backgroundColor: surface,
                          color: color,
                          border: `1px solid ${color}44`,
                          borderRadius: "4px",
                          padding: "1px 7px",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.6px",
                          textTransform: "uppercase",
                        }}>
                          {label}
                        </div>
                      </div>

                      <a
                        href={youtubeUrl(opt.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "20px",
                          opacity: 0.55,
                          textDecoration: "none",
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                        title={`Watch ${opt.name} tutorial`}
                      >
                        🎥
                      </a>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          GAME PLAN TAB
      ══════════════════════════════════════════ */}
      {activeTab === "gameplan" && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: T.bg,
        }}>
          <div style={{ flexShrink: 0, height: "93px" }} />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <GamePlanFlow />
          </div>
        </div>
      )}

      {/* ── Log Tap Modal ── */}
      {modalSub && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.80)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: T.modal,
              border: `1px solid ${T.borderDefault}`,
              borderRadius: "14px",
              padding: "24px",
              width: "100%",
              maxWidth: "360px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <h2 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 800, color: T.textPrimary }}>
              Log a tap!
            </h2>
            <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: T.red, fontWeight: 700 }}>
              {modalSub}
            </p>

            <label style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              color: T.textTertiary,
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}>
              Date
            </label>
            <input
              type="date"
              value={modalDate}
              onChange={(e) => setModalDate(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: T.surface,
                border: `1px solid ${T.borderDefault}`,
                borderRadius: "8px",
                padding: "9px 10px",
                color: T.textPrimary,
                fontSize: "14px",
                marginBottom: "16px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />

            <label style={{
              display: "block",
              fontSize: "11px",
              fontWeight: 700,
              color: T.textTertiary,
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
            }}>
              Note (optional)
            </label>
            <textarea
              value={modalNote}
              onChange={(e) => setModalNote(e.target.value)}
              placeholder="How'd you get it? From guard? Fast tap?"
              rows={3}
              style={{
                width: "100%",
                backgroundColor: T.surface,
                border: `1px solid ${T.borderDefault}`,
                borderRadius: "8px",
                padding: "9px 10px",
                color: T.textPrimary,
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "none",
                marginBottom: "20px",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  backgroundColor: T.surface,
                  color: T.textTertiary,
                  border: `1px solid ${T.borderDefault}`,
                  borderRadius: "10px",
                  padding: "13px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmTap}
                style={{
                  flex: 2,
                  background: `linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)`,
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "13px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: "0 0 16px rgba(220,38,38,0.35)",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Confirm Tap ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive grid */}
      <style>{`
        @media (min-width: 480px) {
          .submissions-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (min-width: 768px) {
          .submissions-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.6);
        }
        button:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}

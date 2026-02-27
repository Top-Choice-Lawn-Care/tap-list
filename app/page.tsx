"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const GamePlanFlow = dynamic(() => import("./components/GamePlanFlow"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#4b5563", fontSize: "14px" }}>
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

const TYPE_COLORS: Record<OptionType, string> = {
  submission: "#dc2626",
  sweep: "#2563eb",
  escape: "#16a34a",
  transition: "#9333ea",
  takedown: "#9333ea",
};

const TYPE_LABELS: Record<OptionType, string> = {
  submission: "Submission",
  sweep: "Sweep",
  escape: "Escape",
  transition: "Transition",
  takedown: "Takedown",
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

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab] = useState<"taplist" | "flow" | "gameplan">("gameplan");

  // Tap List state
  const [tapData, setTapData] = useState<TapData>({});
  const [modalSub, setModalSub] = useState<string | null>(null);
  const [modalDate, setModalDate] = useState<string>(getTodayDate());
  const [modalNote, setModalNote] = useState<string>("");
  const [shareMsg, setShareMsg] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

  // Flow state
  const [selectedPosition, setSelectedPosition] = useState<FlowPosition | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setTapData(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tapData));
    }
  }, [tapData, hydrated]);

  const totalCollected = SUBMISSIONS.filter(
    (s) => (tapData[s.name]?.length ?? 0) > 0
  ).length;
  const totalTaps = Object.values(tapData).reduce(
    (sum, entries) => sum + entries.length,
    0
  );

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
      return {
        ...prev,
        [modalSub]: [...existing, { date: modalDate, note: modalNote }],
      };
    });
    closeModal();
  }

  function handleShare() {
    let topMove = "none";
    let topCount = 0;
    for (const [name, entries] of Object.entries(tapData)) {
      if (entries.length > topCount) {
        topCount = entries.length;
        topMove = name;
      }
    }
    const text =
      totalCollected === 0
        ? "I'm just getting started on JJ Game Plan. 🥋"
        : `I've tapped ${totalCollected} unique submissions on JJ Game Plan. My most caught: ${topMove}. 🥋`;

    setShareMsg(text);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setTimeout(() => setShareMsg(""), 3000);
  }

  function youtubeUrl(name: string): string {
    const query = encodeURIComponent(`bjj ${name} tutorial`);
    return `https://www.youtube.com/results?search_query=${query}`;
  }

  if (!hydrated) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        color: "#fff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: "0 0 60px 0",
      }}
    >
      {/* ── Sticky Header ── */}
      <div
        style={{
          padding: "24px 16px 0",
          borderBottom: "1px solid #1f1f1f",
          position: "sticky",
          top: 0,
          backgroundColor: "#0a0a0a",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            margin: "0 0 12px 0",
            fontSize: "24px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "#fff",
          }}
        >
          🔗 JJ Game Plan
        </h1>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => setActiveTab("gameplan")}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              border: "none",
              borderRadius: "6px 6px 0 0",
              backgroundColor: activeTab === "gameplan" ? "#1a1a1a" : "transparent",
              color: activeTab === "gameplan" ? "#fff" : "#6b7280",
              borderBottom: activeTab === "gameplan" ? "2px solid #7c3aed" : "2px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            🔗 Game Plan
          </button>
          <button
            onClick={() => { setActiveTab("flow"); setSelectedPosition(null); }}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              border: "none",
              borderRadius: "6px 6px 0 0",
              backgroundColor: activeTab === "flow" ? "#1a1a1a" : "transparent",
              color: activeTab === "flow" ? "#fff" : "#6b7280",
              borderBottom: activeTab === "flow" ? "2px solid #9333ea" : "2px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            🗺️ Flow
          </button>
          <button
            onClick={() => setActiveTab("taplist")}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              border: "none",
              borderRadius: "6px 6px 0 0",
              backgroundColor: activeTab === "taplist" ? "#1a1a1a" : "transparent",
              color: activeTab === "taplist" ? "#fff" : "#6b7280",
              borderBottom: activeTab === "taplist" ? "2px solid #dc2626" : "2px solid transparent",
              transition: "all 0.15s ease",
            }}
          >
            🥋 Tap List
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          TAP LIST TAB
      ══════════════════════════════════════════ */}
      {activeTab === "taplist" && (
        <>
          {/* Stats bar */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #1f1f1f",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "14px" }}>
              {totalCollected}/{SUBMISSIONS.length} collected
            </span>
            <span style={{ color: "#6b7280", fontSize: "14px" }}>
              {totalTaps} total taps
            </span>
            <button
              onClick={handleShare}
              style={{
                marginLeft: "auto",
                backgroundColor: "#1f1f1f",
                color: "#d1d5db",
                border: "1px solid #374151",
                borderRadius: "6px",
                padding: "4px 12px",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Share 📤
            </button>
          </div>

          {shareMsg && (
            <div
              style={{
                margin: "8px 16px",
                backgroundColor: "#1f1f1f",
                border: "1px solid #374151",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "13px",
                color: "#d1d5db",
              }}
            >
              Copied! {shareMsg}
            </div>
          )}

          {/* Submission grid */}
          <div style={{ padding: "0 16px" }}>
            {CATEGORIES.map((category) => {
              const subs = SUBMISSIONS.filter((s) => s.category === category);
              return (
                <div key={category}>
                  <div
                    style={{
                      padding: "20px 0 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "1.5px",
                      color: "#4b5563",
                      textTransform: "uppercase",
                    }}
                  >
                    {category}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "10px",
                    }}
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
                            backgroundColor: "#1a1a1a",
                            border: collected
                              ? "1px solid #2a2a2a"
                              : "1px solid #2a2a2a",
                            borderLeft: collected
                              ? "3px solid #dc2626"
                              : "1px solid #2a2a2a",
                            borderRadius: "8px",
                            padding: "12px 12px 10px",
                            cursor: "pointer",
                            position: "relative",
                            boxShadow: collected
                              ? "0 0 12px rgba(220, 38, 38, 0.18)"
                              : "none",
                            transition: "all 0.15s ease",
                            userSelect: "none",
                            WebkitTapHighlightColor: "transparent",
                            minHeight: "72px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          {collected && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                backgroundColor: "#dc2626",
                                color: "#fff",
                                borderRadius: "10px",
                                padding: "1px 7px",
                                fontSize: "11px",
                                fontWeight: 700,
                                lineHeight: "18px",
                              }}
                            >
                              ×{count}
                            </div>
                          )}

                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: collected ? "#fff" : "#9ca3af",
                              lineHeight: "1.3",
                              paddingRight: collected ? "28px" : "0",
                            }}
                          >
                            {sub.name}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              marginTop: "6px",
                            }}
                          >
                            <a
                              href={youtubeUrl(sub.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: "16px",
                                opacity: 0.5,
                                textDecoration: "none",
                                lineHeight: 1,
                              }}
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
            /* ── Position List ── */
            <>
              <div
                style={{
                  padding: "16px 0 8px",
                  fontSize: "13px",
                  color: "#6b7280",
                  lineHeight: "1.5",
                }}
              >
                Where are you on the mat? Pick a position to see your options.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "16px" }}>
                {FLOW_POSITIONS.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos)}
                    style={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #2a2a2a",
                      borderRadius: "10px",
                      padding: "16px",
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
                    <span style={{ fontSize: "28px", lineHeight: 1 }}>{pos.emoji}</span>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff" }}>
                        {pos.label}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                        {pos.options.length} options
                      </div>
                    </div>
                    <span style={{ marginLeft: "auto", color: "#4b5563", fontSize: "18px" }}>›</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* ── Position Detail ── */
            <>
              {/* Back button + "You are here" */}
              <div style={{ padding: "16px 0 0" }}>
                <button
                  onClick={() => setSelectedPosition(null)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#9333ea",
                    fontSize: "14px",
                    fontWeight: 700,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    padding: "0 0 12px 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  ‹ All Positions
                </button>

                <div
                  style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderLeft: "3px solid #9333ea",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", color: "#9333ea", textTransform: "uppercase", marginBottom: "4px" }}>
                    You are here
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>{selectedPosition.emoji}</span>
                    <span>{selectedPosition.label}</span>
                  </div>
                </div>
              </div>

              {/* Options list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "16px" }}>
                {selectedPosition.options.map((opt, i) => {
                  const color = TYPE_COLORS[opt.type];
                  const label = TYPE_LABELS[opt.type];
                  return (
                    <div
                      key={i}
                      style={{
                        backgroundColor: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderLeft: `3px solid ${color}`,
                        borderRadius: "8px",
                        padding: "14px 14px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {/* Name + badge */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", lineHeight: "1.3" }}>
                          {opt.name}
                        </div>
                        <div
                          style={{
                            display: "inline-block",
                            marginTop: "5px",
                            backgroundColor: color + "22",
                            color: color,
                            border: `1px solid ${color}55`,
                            borderRadius: "4px",
                            padding: "1px 7px",
                            fontSize: "11px",
                            fontWeight: 700,
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          {label}
                        </div>
                      </div>

                      {/* YouTube button */}
                      <a
                        href={youtubeUrl(opt.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "22px",
                          opacity: 0.6,
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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0a0a0a",
          }}
        >
          {/* Sticky header replica for positioning */}
          <div style={{ flexShrink: 0, height: "93px" }} />
          {/* Full-height flow canvas */}
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
            backgroundColor: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "360px",
            }}
          >
            <h2
              style={{
                margin: "0 0 4px 0",
                fontSize: "18px",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              Log a tap! 🥋
            </h2>
            <p
              style={{
                margin: "0 0 20px 0",
                fontSize: "14px",
                color: "#dc2626",
                fontWeight: 700,
              }}
            >
              {modalSub}
            </p>

            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#6b7280",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Date
            </label>
            <input
              type="date"
              value={modalDate}
              onChange={(e) => setModalDate(e.target.value)}
              style={{
                width: "100%",
                backgroundColor: "#0a0a0a",
                border: "1px solid #374151",
                borderRadius: "6px",
                padding: "8px 10px",
                color: "#fff",
                fontSize: "14px",
                marginBottom: "16px",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />

            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#6b7280",
                marginBottom: "6px",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Note (optional)
            </label>
            <textarea
              value={modalNote}
              onChange={(e) => setModalNote(e.target.value)}
              placeholder="How'd you get it? From guard? Fast tap?"
              rows={3}
              style={{
                width: "100%",
                backgroundColor: "#0a0a0a",
                border: "1px solid #374151",
                borderRadius: "6px",
                padding: "8px 10px",
                color: "#fff",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "none",
                marginBottom: "20px",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  backgroundColor: "#0a0a0a",
                  color: "#6b7280",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmTap}
                style={{
                  flex: 2,
                  backgroundColor: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Confirm Tap ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive grid styles */}
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
          filter: invert(1);
        }
      `}</style>
    </div>
  );
}

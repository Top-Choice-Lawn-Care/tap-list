"use client";

import { useState, useEffect } from "react";

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

export default function Home() {
  const [tapData, setTapData] = useState<TapData>({});
  const [modalSub, setModalSub] = useState<string | null>(null);
  const [modalDate, setModalDate] = useState<string>(getTodayDate());
  const [modalNote, setModalNote] = useState<string>("");
  const [shareMsg, setShareMsg] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);

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
    // Find top move
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
        ? "I'm just getting started on The Tap List. 🥋"
        : `I've tapped ${totalCollected} unique submissions on The Tap List. My most caught: ${topMove}. 🥋`;

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
      {/* Header */}
      <div
        style={{
          padding: "24px 16px 12px",
          borderBottom: "1px solid #1f1f1f",
          position: "sticky",
          top: 0,
          backgroundColor: "#0a0a0a",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            margin: "0 0 4px 0",
            fontSize: "24px",
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "#fff",
          }}
        >
          🥋 The Tap List
        </h1>

        {/* Stats bar */}
        <div
          style={{
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
              marginTop: "8px",
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
      </div>

      {/* Content */}
      <div style={{ padding: "0 16px" }}>
        {CATEGORIES.map((category) => {
          const subs = SUBMISSIONS.filter((s) => s.category === category);
          return (
            <div key={category}>
              {/* Category header */}
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

              {/* Grid */}
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
                      {/* Count badge */}
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

                      {/* Name */}
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

                      {/* YouTube button */}
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

      {/* Modal */}
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

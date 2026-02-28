"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

const GamePlanFlow = dynamic(() => import("./components/GamePlanFlow"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6b7280", fontSize: "14px" }}>
      Loading game plan…
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

type TapEntry = { date: string; note: string; };
type TapData = { [submissionName: string]: TapEntry[]; };
type Difficulty = "white" | "blue" | "purple" | "brown" | "black";
type Submission = { name: string; category: string; difficulty: Difficulty; };
type Tab = "taplist" | "gameplan" | "timer";

const DIFFICULTY_DOT: Record<Difficulty, { color: string; label: string }> = {
  white:  { color: "#e5e7eb", label: "Common"      },
  blue:   { color: "#3b82f6", label: "Intermediate" },
  purple: { color: "#a855f7", label: "Advanced"     },
  brown:  { color: "#d97706", label: "Expert"       },
  black:  { color: "#9ca3af", label: "Elite"        },
};

// ─── Submissions ──────────────────────────────────────────────────────────────

const SUBMISSIONS: Submission[] = [
  { name: "Rear Naked Choke",      category: "Chokes",    difficulty: "white"  },
  { name: "Guillotine (High Elbow)", category: "Chokes",  difficulty: "white"  },
  { name: "Arm-In Guillotine",     category: "Chokes",    difficulty: "blue"   },
  { name: "Triangle Choke",        category: "Chokes",    difficulty: "white"  },
  { name: "D'Arce Choke",          category: "Chokes",    difficulty: "blue"   },
  { name: "Anaconda Choke",        category: "Chokes",    difficulty: "blue"   },
  { name: "Head and Arm Triangle", category: "Chokes",    difficulty: "blue"   },
  { name: "North-South Choke",     category: "Chokes",    difficulty: "blue"   },
  { name: "Bow and Arrow Choke",   category: "Chokes",    difficulty: "blue"   },
  { name: "Ezekiel Choke",         category: "Chokes",    difficulty: "blue"   },
  { name: "Loop Choke",            category: "Chokes",    difficulty: "purple" },
  { name: "Clock Choke",           category: "Chokes",    difficulty: "blue"   },
  { name: "Cross Collar Choke",    category: "Chokes",    difficulty: "white"  },
  { name: "Armbar",                category: "Arm Locks", difficulty: "white"  },
  { name: "Kimura",                category: "Arm Locks", difficulty: "white"  },
  { name: "Americana",             category: "Arm Locks", difficulty: "white"  },
  { name: "Omoplata",              category: "Arm Locks", difficulty: "blue"   },
  { name: "Wristlock",             category: "Arm Locks", difficulty: "blue"   },
  { name: "Baratoplata",           category: "Arm Locks", difficulty: "purple" },
  { name: "Straight Ankle Lock",   category: "Leg Locks", difficulty: "white"  },
  { name: "Inside Heel Hook",      category: "Leg Locks", difficulty: "purple" },
  { name: "Outside Heel Hook",     category: "Leg Locks", difficulty: "purple" },
  { name: "Kneebar",               category: "Leg Locks", difficulty: "blue"   },
  { name: "Calf Slicer",           category: "Leg Locks", difficulty: "blue"   },
  { name: "Toe Hold",              category: "Leg Locks", difficulty: "blue"   },
  { name: "Gogoplata",             category: "Specialty", difficulty: "purple" },
  { name: "Peruvian Necktie",      category: "Specialty", difficulty: "purple" },
  { name: "Twister",               category: "Specialty", difficulty: "purple" },
  { name: "Buggy Choke",           category: "Specialty", difficulty: "purple" },
  { name: "Banana Split",          category: "Specialty", difficulty: "purple" },
  // ── Added: white → black range ────────────────────────────────────────────
  { name: "Von Flue Choke",        category: "Chokes",    difficulty: "white"  },
  { name: "Gift Wrap",             category: "Specialty", difficulty: "white"  },
  { name: "Baseball Bat Choke",    category: "Chokes",    difficulty: "blue"   },
  { name: "Paper Cutter Choke",    category: "Chokes",    difficulty: "blue"   },
  { name: "Mounted Triangle",      category: "Chokes",    difficulty: "blue"   },
  { name: "Japanese Necktie",      category: "Chokes",    difficulty: "purple" },
  { name: "Tarikoplata",           category: "Arm Locks", difficulty: "purple" },
  { name: "Electric Chair",        category: "Leg Locks", difficulty: "purple" },
  { name: "Suloev Stretch",        category: "Leg Locks", difficulty: "brown"  },
  { name: "Belly Down Armbar",     category: "Arm Locks", difficulty: "brown"  },
  { name: "Estima Lock",           category: "Leg Locks", difficulty: "brown"  },
  { name: "Flying Armbar",         category: "Arm Locks", difficulty: "brown"  },
  { name: "Worm Guard Choke",      category: "Chokes",    difficulty: "black"  },
  { name: "Truck Roll",            category: "Specialty", difficulty: "black"  },
  { name: "Marceloplata",          category: "Arm Locks", difficulty: "black"  },
];
const CATEGORIES = ["Chokes", "Arm Locks", "Leg Locks", "Specialty"];
const STORAGE_KEY = "tap-list-data";
const STREAK_KEY = "jj-streak-data";

// ─── Belt System ──────────────────────────────────────────────────────────────

type Belt = { name: string; emoji: string; min: number; max: number; color: string; bg: string; glow: string; };
const BELTS: Belt[] = [
  { name: "White",  emoji: "🤍", min: 0,  max: 8,  color: "#e5e7eb", bg: "rgba(229,231,235,0.08)", glow: "rgba(229,231,235,0.25)" },
  { name: "Blue",   emoji: "💙", min: 9,  max: 18, color: "#3b82f6", bg: "rgba(59,130,246,0.10)",  glow: "rgba(59,130,246,0.30)" },
  { name: "Purple", emoji: "💜", min: 19, max: 29, color: "#a855f7", bg: "rgba(168,85,247,0.10)",  glow: "rgba(168,85,247,0.30)" },
  { name: "Brown",  emoji: "🤎", min: 30, max: 40, color: "#d97706", bg: "rgba(217,119,6,0.10)",   glow: "rgba(217,119,6,0.30)"  },
  { name: "Black",  emoji: "🖤", min: 41, max: 44, color: "#9ca3af", bg: "rgba(156,163,175,0.10)", glow: "rgba(156,163,175,0.30)" },
];

function getBelt(count: number): Belt {
  return BELTS.find((b) => count >= b.min && count <= b.max) ?? BELTS[BELTS.length - 1];
}

// ─── Streak Logic ─────────────────────────────────────────────────────────────

type StreakData = { lastTapDate: string; streakCount: number; };

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function computeStreak(tapData: TapData): number {
  // Collect all unique dates that have at least one tap
  const allDates = new Set<string>();
  for (const entries of Object.values(tapData)) {
    for (const e of entries) allDates.add(e.date);
  }
  if (allDates.size === 0) return 0;
  // Sort descending
  const sorted = Array.from(allDates).sort((a, b) => b.localeCompare(a));
  const today = getTodayDate();
  // Streak must include today or yesterday
  if (sorted[0] !== today) {
    // Check yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,"0")}-${String(yesterday.getDate()).padStart(2,"0")}`;
    if (sorted[0] !== yStr) return 0;
  }
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const a = new Date(sorted[i-1]);
    const b = new Date(sorted[i]);
    const diff = Math.round((a.getTime() - b.getTime()) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const T = {
  bg:       "#09090d",
  surface:  "#131318",
  elevated: "#1c1c24",
  modal:    "#232329",
  borderSubtle:  "rgba(255,255,255,0.06)",
  borderDefault: "rgba(255,255,255,0.09)",
  borderStrong:  "rgba(255,255,255,0.14)",
  textPrimary:   "#e8e8ea",
  textSecondary: "#9ca3af",
  textTertiary:  "#6b7280",
  textDisabled:  "#4b5563",
  red:    "#dc2626",
  blue:   "#2563eb",
  green:  "#16a34a",
  purple: "#7c3aed",
};



// ─── Professor Max SVG Character ──────────────────────────────────────────────

const PROFESSOR_QUOTES = [
  "Position before submission. Always.",
  "Jiu-jitsu is a language. Speak it under pressure.",
  "Progress arrives when you've earned it.",
  "Composure under pressure is a skill. Train it.",
  "Movement is not progress — efficiency is.",
  "Jiu-jitsu punishes urgency.",
  "You came to learn to fight. Stay and you'll learn to think.",
  "Every technique fails in the wrong context.",
  "Roll with people who make you uncomfortable.",
  "Back mount is the highest position.",
];

function ProfessorMax({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const [quote] = useState(() => PROFESSOR_QUOTES[Math.floor(Math.random() * PROFESSOR_QUOTES.length)]);
  const [blink, setBlink] = useState(false);

  // Blink every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        @keyframes profSlideUp   { from { transform: translateY(120px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        @keyframes profSlideDown { from { transform: translateY(0); opacity:1; }    to { transform: translateY(120px); opacity:0; } }
        @keyframes breathe { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(1.04); } }
        @keyframes bubblePop { 0% { transform: scale(0.6); opacity:0; } 70% { transform: scale(1.05); } 100% { transform: scale(1); opacity:1; } }
        .prof-bubble { animation: bubblePop 0.35s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .prof-body { animation: breathe 3.5s ease-in-out infinite; transform-origin: center 60%; }
      `}</style>
      <div
        onClick={onDismiss}
        style={{
          position: "fixed",
          bottom: 24,
          right: 16,
          zIndex: 500,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
          animation: visible ? "profSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards" : "profSlideDown 0.25s ease-in forwards",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {/* Speech bubble */}
        <div
          className="prof-bubble"
          style={{
            backgroundColor: "#1e1e2a",
            border: "1px solid rgba(147,51,234,0.4)",
            borderRadius: "12px 12px 4px 12px",
            padding: "10px 13px",
            maxWidth: "220px",
            fontSize: "12px",
            lineHeight: "1.5",
            color: T.textPrimary,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(147,51,234,0.15)",
            position: "relative",
          }}
        >
          <span style={{ fontStyle: "italic" }}>&ldquo;{quote}&rdquo;</span>
          <div style={{ fontSize: "10px", color: "#9333ea", marginTop: "4px", fontWeight: 700 }}>— Prof. Max</div>
          {/* Triangle pointer */}
          <div style={{
            position: "absolute", bottom: "-7px", right: "26px",
            width: 0, height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "7px solid rgba(147,51,234,0.4)",
          }} />
        </div>

        {/* SVG Avatar */}
        <div style={{
          width: 72, height: 72,
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid #9333ea",
          boxShadow: "0 0 16px rgba(147,51,234,0.35), 0 4px 12px rgba(0,0,0,0.5)",
          backgroundColor: "#0f0f1a",
          flexShrink: 0,
        }}>
          <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg">
            {/* Background */}
            <rect width="72" height="72" fill="#0f0f1a"/>

            {/* Gi body */}
            <g className="prof-body">
              <polygon points="20,44 52,44 50,72 22,72" fill="#d4d4e0"/>
              <polygon points="36,48 20,44 24,44" fill="#6b7280"/>
              <polygon points="36,48 52,44 48,44" fill="#6b7280"/>
              {/* Black belt */}
              <rect x="20" y="58" width="32" height="5" rx="1" fill="#0a0a0a"/>
              <rect x="20" y="59" width="32" height="1.5" fill="#222"/>
            </g>

            {/* Neck */}
            <rect x="31" y="37" width="10" height="9" rx="3" fill="#c4a882"/>

            {/* Ears */}
            <ellipse cx="22" cy="28" rx="3" ry="5" fill="#b8906a"/>
            <ellipse cx="50" cy="28" rx="3" ry="5" fill="#b8906a"/>

            {/* Head */}
            <ellipse cx="36" cy="27" rx="14" ry="16" fill="#c4a882"/>

            {/* Square jaw — flat bottom, sharp corners */}
            <rect x="22" y="33" width="28" height="11" rx="2" fill="#c4a882"/>

            {/* Spiky hair — base + individual spikes */}
            <ellipse cx="36" cy="14" rx="14" ry="7" fill="#1e1e1e"/>
            <rect x="22" y="12" width="28" height="6" fill="#1e1e1e"/>
            <polygon points="26,14 24,3 29,13" fill="#1e1e1e"/>
            <polygon points="31,12 30,1 34,11" fill="#1e1e1e"/>
            <polygon points="36,11 36,0 39,11" fill="#1e1e1e"/>
            <polygon points="41,12 43,1 45,12" fill="#1e1e1e"/>
            <polygon points="46,14 48,4 50,14" fill="#1e1e1e"/>

            {/* Eyebrows */}
            <rect x="25" y="21" width="10" height="2.5" rx="1.2" fill="#1a1a1a" transform="rotate(-7,30,22)"/>
            <rect x="37" y="21" width="10" height="2.5" rx="1.2" fill="#1a1a1a" transform="rotate(7,42,22)"/>

            {/* Eyes */}
            {blink ? (
              <>
                <rect x="26" y="25" width="8" height="2" rx="1" fill="#1a1a1a"/>
                <rect x="38" y="25" width="8" height="2" rx="1" fill="#1a1a1a"/>
              </>
            ) : (
              <>
                <ellipse cx="30" cy="27" rx="5" ry="4" fill="white"/>
                <ellipse cx="42" cy="27" rx="5" ry="4" fill="white"/>
                {/* Bright blue irises */}
                <ellipse cx="31" cy="27" rx="3" ry="3" fill="#3b82f6"/>
                <ellipse cx="43" cy="27" rx="3" ry="3" fill="#3b82f6"/>
                {/* Pupils */}
                <ellipse cx="31.5" cy="27" rx="1.7" ry="1.8" fill="#111"/>
                <ellipse cx="43.5" cy="27" rx="1.7" ry="1.8" fill="#111"/>
                {/* Glints */}
                <circle cx="32.2" cy="26" r="0.9" fill="white"/>
                <circle cx="44.2" cy="26" r="0.9" fill="white"/>
              </>
            )}

            {/* Nose */}
            <ellipse cx="36" cy="33" rx="2.5" ry="1.5" fill="#b0906a"/>

            {/* Mouth — slight smile */}
            <path d="M31 37.5 Q36 39.5 41 37.5" stroke="#8a6650" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </>
  );
}

// ─── Video Modal ──────────────────────────────────────────────────────────────

const VIDEO_IDS: Record<string, string> = {
  // Chokes
  "Rear Naked Choke": "KH6qCjgLXJA",          // Stephan Kesting - Tightest RNC tutorial
  "Guillotine (High Elbow)": "XCiRr7TW2bk",    // John Danaher - The High Elbow Guillotine
  "Arm-In Guillotine": "9qdBYSueAZk",           // Neil Melanson - How To: Arm in Guillotine (No-Gi)
  "Triangle Choke": "LDE0fkzZT6I",              // John Danaher - Perfect Triangle Choke
  "D'Arce Choke": "RnqhyUcj0T8",               // Darce Choke Full System
  "Anaconda Choke": "E2bzUBx372A",              // Chewjitsu - BJJ Anaconda Choke
  "Head and Arm Triangle": "VVo66hr8MTI",        // Chewjitsu - Arm Triangle Choke from mount
  "North-South Choke": "RkFHJHC58qc",           // Marcelo Garcia with Stephan Kesting
  "Bow and Arrow Choke": "nS6ALx73epc",          // Stephan Kesting - Bow and Arrow with Killer Details
  "Ezekiel Choke": "jIXrWitQZx4",              // Erik Paulson via BJJ Fanatics
  "Loop Choke": "SNASDxyjcAA",                  // Loop Chokes Please! (Basics)
  "Clock Choke": "jAGbvarXopw",                 // How to Do the Clock Choke in 5 Easy Steps
  "Cross Collar Choke": "uuyiUxsyywM",           // Henry Akins via BJJ Fanatics - Perfect Cross Collar Choke
  // Arm Locks
  "Armbar": "8wNQ5UGLQHk",                     // Stephan Kesting - 10 Ways to Finish the Armbar
  "Kimura": "mVkKOPNGvjA",                      // Chewjitsu - Kimura From Closed Guard
  "Americana": "DXQ5BJ5gz8U",                   // Jeff Glover via BJJ Fanatics
  "Omoplata": "tfvEGtSCIRI",                    // Stephan Kesting - Omoplata vs Marceloplata vs Baratoplata
  "Wristlock": "fnbfTQ5CVSw",                   // Roger Gracie via BJJ Fanatics
  "Baratoplata": "7PzrTuuHzZ4",                 // Joao Miyao via BJJ Fanatics - Baratoplata from Spider Guard
  // Leg Locks
  "Straight Ankle Lock": "Ksy8jJTZYec",          // Chewjitsu - Straight Ankle Lock and Counter
  "Inside Heel Hook": "w-W0ug7Edag",            // Lachlan Giles - Inside Heel Hook Setup and Safety
  "Outside Heel Hook": "Zs14XxOcBr8",           // Gordon Ryan via BJJ Fanatics
  "Kneebar": "oBlMI4iKm3c",                     // The First Kneebar You Should Learn
  "Calf Slicer": "RXe0VGfv5FI",                 // Knight Jiu Jitsu - Calf Slicers from Everywhere
  "Toe Hold": "7wVbUS0jCts",                    // Knight Jiu Jitsu - The Toe Hold: How & When to Use It
  // Specialty
  "Gogoplata": "9gUzj39Kh0s",                   // Jeff Glover via BJJ Fanatics - Gogoplata Submission
  "Peruvian Necktie": "9uO9IRBC92Q",            // Peruvian Necktie System Full Instructional
  "Twister": "V3nDmb66Xpc",                     // Stephan Kesting - The Easiest Way to do the Twister
  "Buggy Choke": "0VDUwuyT6N4",                 // Fix Your Buggy Choke - How To Buggy Choke in BJJ
  "Banana Split": "_TPwJM8JCD4",                 // Andre Galvao via BJJ Fanatics - Banana Split Submission
  // ── White additions ────────────────────────────────────────────────────────
  "Von Flue Choke": "wIAVYLB8oXE",              // Batuhan Asig via BJJ Fanatics - Von Flue Choke
  "Gift Wrap": "s8KU1LFVW2Y",                    // Chewjitsu - Gift Wrap Submission Options
  // ── Blue additions ─────────────────────────────────────────────────────────
  "Baseball Bat Choke": "s14Iiq41uAc",           // Daniele Bolelli via BJJ Fanatics - BRUTAL Baseball Bat Choke
  "Paper Cutter Choke": "yfPKpzxn2yY",           // Chewjitsu - Paper Cutter Choke (Arms Race series)
  "Mounted Triangle": "s4OLLnXBgKw",             // Khabib Nurmagomedov via BJJ Fanatics - Mounted Triangle
  // ── Purple additions ───────────────────────────────────────────────────────
  "Japanese Necktie": "JuQKlZfhpHA",             // Stephan Kesting - The Japanese Necktie
  "Tarikoplata": "9yyauPoZmGI",                  // Tarik Hopstock via BJJ Fanatics - Understanding The Tarikoplata
  "Electric Chair": "GXg9wtpMlUw",               // BJJ for Breakfast - Lockdown to Electric Chair
  // ── Brown additions ────────────────────────────────────────────────────────
  "Suloev Stretch": "kwS4-kslujQ",               // The Suloev Stretch Submission For BJJ & MMA
  "Belly Down Armbar": "cpW9dsFxQco",             // Joel Bouhey via BJJ Fanatics - Belly Down Armbar
  "Estima Lock": "dwoUiTFBEaM",                  // Braulio Estima - How To Do The Estima Lock
  "Flying Armbar": "5fLMn0OkLgs",                // Flying Armbar tutorial (not just a sports clip)
  // ── Black additions ────────────────────────────────────────────────────────
  "Worm Guard Choke": "gEWO8PxSXuU",             // BJJ Scout - Keenan Cornelius Worm Guard Study
  "Truck Roll": "rE94hsb74FI",                    // Eddie Bravo 10th Planet - Truck to Twister Submission
  "Marceloplata": "tfvEGtSCIRI",                  // Stephan Kesting - Omoplata vs Marceloplata vs Baratoplata
};

function VideoModal({ query, onClose }: { query: string | null; onClose: () => void }) {
  if (!query) return null;
  const videoId = VIDEO_IDS[query] ?? null;
  const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1` : null;
  const fallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent("bjj " + query + " tutorial")}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 800,
        backgroundColor: "rgba(0,0,0,0.92)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "16px", backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "640px",
          backgroundColor: "#0f0f18",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: T.textPrimary }}>{query}</div>
            <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: "2px" }}>BJJ tutorial</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: T.textPrimary, fontSize: "18px",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: "inherit",
            }}
          >
            ×
          </button>
        </div>

        {/* Embedded Video */}
        {videoId ? (
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src={embedUrl!}
              style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%", border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={`BJJ ${query} tutorial`}
            />
          </div>
        ) : (
          <div style={{ padding: "32px 16px", textAlign: "center" }}>
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#a78bfa", fontSize: "14px" }}
            >
              Watch on YouTube →
            </a>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: "12px 16px" }}>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "12px", color: T.textTertiary,
              textDecoration: "none", display: "flex",
              alignItems: "center", gap: "4px",
            }}
          >
            🔗 Open full YouTube search ›
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Belt Unlock Toast ────────────────────────────────────────────────────────

function BeltUnlockToast({ belt, onDismiss }: { belt: Belt; onDismiss: () => void }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!visible) setTimeout(onDismiss, 350);
  }, [visible, onDismiss]);

  return (
    <>
      <style>{`
        @keyframes beltIn  { from { transform:translateY(80px) scale(0.9); opacity:0; } to { transform:translateY(0) scale(1); opacity:1; } }
        @keyframes beltOut { from { transform:translateY(0) scale(1); opacity:1; } to { transform:translateY(80px) scale(0.9); opacity:0; } }
        @keyframes shimmer { 0%,100% { opacity:0.7; } 50% { opacity:1; } }
      `}</style>
      <div style={{
        position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)",
        zIndex: 600, pointerEvents: "none",
        animation: visible ? "beltIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards" : "beltOut 0.35s ease-in forwards",
      }}>
        <div style={{
          backgroundColor: "#1a1a28",
          border: `2px solid ${belt.color}`,
          borderRadius: "16px", padding: "16px 24px",
          textAlign: "center", minWidth: "220px",
          boxShadow: `0 0 30px ${belt.glow}, 0 8px 32px rgba(0,0,0,0.6)`,
        }}>
          <div style={{ fontSize: "36px", animation: "shimmer 1s ease infinite" }}>{belt.emoji}</div>
          <div style={{ fontSize: "14px", fontWeight: 800, color: belt.color, marginTop: "6px" }}>
            {belt.name} Belt Unlocked!
          </div>
          <div style={{ fontSize: "12px", color: T.textTertiary, marginTop: "2px" }}>
            {belt.min}+ submissions collected
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Roll Timer ───────────────────────────────────────────────────────────────

function RollTimer() {
  const WORK_TIME = 300; // 5 minutes
  const REST_TIME = 60;  // 1 minute
  const [phase, setPhase] = useState<"ready" | "work" | "rest" | "done">("ready");
  const [seconds, setSeconds] = useState(WORK_TIME);
  const [rounds, setRounds] = useState(0);
  const [maxRounds, setMaxRounds] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const start = useCallback(() => {
    stop();
    setPhase("work");
    setSeconds(WORK_TIME);
    setRounds(0);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
  }, [stop]);

  useEffect(() => {
    if (seconds === 0) {
      stop();
      if (phase === "work") {
        const newRounds = rounds + 1;
        setRounds(newRounds);
        if (newRounds >= maxRounds) {
          setPhase("done");
        } else {
          setPhase("rest");
          setSeconds(REST_TIME);
          if (typeof navigator.vibrate === "function") navigator.vibrate([200, 100, 200]);
          intervalRef.current = setInterval(() => {
            setSeconds((prev) => {
              if (prev <= 1) return 0;
              return prev - 1;
            });
          }, 1000);
        }
      } else if (phase === "rest") {
        setPhase("work");
        setSeconds(WORK_TIME);
        if (typeof navigator.vibrate === "function") navigator.vibrate([400]);
        intervalRef.current = setInterval(() => {
          setSeconds((prev) => {
            if (prev <= 1) return 0;
            return prev - 1;
          });
        }, 1000);
      }
    }
  }, [seconds, phase, rounds, maxRounds, stop]);

  useEffect(() => () => stop(), [stop]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const phaseColor = phase === "work" ? T.red : phase === "rest" ? T.green : phase === "done" ? T.purple : T.textSecondary;
  const phaseLabel = phase === "ready" ? "READY" : phase === "work" ? "ROLLING" : phase === "rest" ? "REST" : "DONE";
  const totalSecs = phase === "work" ? WORK_TIME : phase === "rest" ? REST_TIME : 1;
  const progress = seconds / totalSecs;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "32px 24px", minHeight: "calc(100vh - 120px)",
      justifyContent: "center", gap: "24px",
    }}>
      {/* Circular timer */}
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle
            cx="100" cy="100" r="90" fill="none"
            stroke={phaseColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 90}`}
            strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress)}`}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            fontSize: "52px", fontWeight: 800, letterSpacing: "-2px",
            color: T.textPrimary, lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}>
            {phase === "done" ? "🎉" : `${mm}:${ss}`}
          </div>
          <div style={{
            fontSize: "11px", fontWeight: 700, letterSpacing: "2px",
            color: phaseColor, marginTop: "6px",
            textTransform: "uppercase",
          }}>
            {phaseLabel}
          </div>
        </div>
      </div>

      {/* Round counter */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {Array.from({ length: maxRounds }).map((_, i) => (
          <div key={i} style={{
            width: 36, height: 36, borderRadius: "50%",
            border: `2px solid ${i < rounds ? T.red : "rgba(255,255,255,0.12)"}`,
            backgroundColor: i < rounds ? "rgba(220,38,38,0.15)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 700,
            color: i < rounds ? T.red : T.textDisabled,
            transition: "all 0.3s ease",
          }}>
            {i < rounds ? "✓" : i + 1}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "12px" }}>
        {phase === "ready" || phase === "done" ? (
          <button
            onClick={start}
            style={{
              background: `linear-gradient(135deg, ${T.red} 0%, #b91c1c 100%)`,
              color: "#fff", border: "none", borderRadius: "14px",
              padding: "18px 40px", fontSize: "18px", fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: `0 0 24px rgba(220,38,38,0.4)`,
              letterSpacing: "-0.3px",
            }}
          >
            {phase === "done" ? "Again" : "Start Rolling"}
          </button>
        ) : (
          <>
            <button
              onClick={() => { stop(); setPhase("ready"); setSeconds(WORK_TIME); setRounds(0); }}
              style={{
                backgroundColor: T.surface, color: T.textTertiary,
                border: `1px solid ${T.borderDefault}`, borderRadius: "12px",
                padding: "14px 24px", fontSize: "15px", fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Reset
            </button>
            <button
              onClick={() => { stop(); setPhase("ready"); setSeconds(WORK_TIME); setRounds(0); }}
              style={{
                backgroundColor: T.elevated, color: T.textPrimary,
                border: `1px solid ${T.borderStrong}`, borderRadius: "12px",
                padding: "14px 24px", fontSize: "15px", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Stop
            </button>
          </>
        )}
      </div>

      {/* Round selector */}
      {(phase === "ready" || phase === "done") && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: T.textDisabled, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
            Rounds
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[2, 3, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setMaxRounds(n)}
                style={{
                  width: 44, height: 44, borderRadius: "10px",
                  backgroundColor: maxRounds === n ? T.elevated : "transparent",
                  border: `1px solid ${maxRounds === n ? T.borderStrong : T.borderSubtle}`,
                  color: maxRounds === n ? T.textPrimary : T.textTertiary,
                  fontSize: "14px", fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s ease",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{
        backgroundColor: T.surface, border: `1px solid ${T.borderSubtle}`,
        borderRadius: "12px", padding: "14px 20px",
        display: "flex", gap: "24px", textAlign: "center",
      }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: T.textPrimary }}>{maxRounds}</div>
          <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: "2px" }}>rounds</div>
        </div>
        <div style={{ width: 1, backgroundColor: T.borderSubtle }} />
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: T.textPrimary }}>5:00</div>
          <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: "2px" }}>per round</div>
        </div>
        <div style={{ width: 1, backgroundColor: T.borderSubtle }} />
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: T.textPrimary }}>1:00</div>
          <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: "2px" }}>rest</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("gameplan");
  const [tapData, setTapData] = useState<TapData>({});
  const [modalSub, setModalSub] = useState<string | null>(null);
  const [modalDate, setModalDate] = useState<string>(getTodayDate());
  const [modalNote, setModalNote] = useState<string>("");
  const [shareMsg, setShareMsg] = useState<string>("");
  const [hydrated, setHydrated] = useState(false);
  // Video modal
  const [videoQuery, setVideoQuery] = useState<string | null>(null);

  // Professor Max
  const [profVisible, setProfVisible] = useState(false);
  const [profMounted, setProfMounted] = useState(false);

  // Belt unlock animation
  const prevBeltRef = useRef<Belt | null>(null);
  const [beltUnlock, setBeltUnlock] = useState<Belt | null>(null);

  // Sticky header height measurement (for gameplan spacer)
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(120);

  // Streak
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTapData(JSON.parse(raw));
    } catch {}
    setHydrated(true);
    // Show Professor Max on load
    setTimeout(() => { setProfMounted(true); setProfVisible(true); }, 800);
    setTimeout(() => setProfVisible(false), 5800);
    setTimeout(() => setProfMounted(false), 6200);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tapData));
      setStreak(computeStreak(tapData));
    }
  }, [tapData, hydrated]);

  const totalCollected = SUBMISSIONS.filter((s) => (tapData[s.name]?.length ?? 0) > 0).length;

  // Belt unlock detection
  useEffect(() => {
    if (!hydrated) return;
    const newBelt = getBelt(totalCollected);
    const prev = prevBeltRef.current;
    if (prev && prev.name !== newBelt.name) {
      setBeltUnlock(newBelt);
      setTimeout(() => setBeltUnlock(null), 5000);
    }
    prevBeltRef.current = newBelt;
  }, [totalCollected, hydrated]);
  // Measure sticky header height dynamically
  useEffect(() => {
    const el = stickyHeaderRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const totalTaps = Object.values(tapData).reduce((sum, e) => sum + e.length, 0);
  const progressPct = Math.round((totalCollected / SUBMISSIONS.length) * 100);
  const currentBelt = getBelt(totalCollected);

  function openModal(name: string) {
    setModalSub(name);
    setModalDate(getTodayDate());
    setModalNote("");
  }

  function closeModal() { setModalSub(null); setModalNote(""); }

  function confirmTap() {
    if (!modalSub) return;
    setTapData((prev) => {
      const existing = prev[modalSub] ?? [];
      return { ...prev, [modalSub]: [...existing, { date: modalDate, note: modalNote }] };
    });
    closeModal();
  }

  function deleteTap(subName: string, index: number) {
    setTapData((prev) => {
      const existing = prev[subName] ?? [];
      const updated = existing.filter((_, i) => i !== index);
      if (updated.length === 0) {
        const next = { ...prev };
        delete next[subName];
        return next;
      }
      return { ...prev, [subName]: updated };
    });
  }

  function handleShare() {
    let topMove = "none", topCount = 0;
    for (const [name, entries] of Object.entries(tapData)) {
      if (entries.length > topCount) { topCount = entries.length; topMove = name; }
    }
    const text = totalCollected === 0
      ? "Just started tracking on JJ Game Plan. 🥋"
      : `🥋 ${totalCollected}/${SUBMISSIONS.length} submissions on JJ Game Plan (${progressPct}%). ${currentBelt.emoji} ${currentBelt.name} belt. Top move: ${topMove} ×${topCount}.${streak > 1 ? ` 🔥 ${streak}-day streak.` : ""}`;
    setShareMsg(text);
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
    setTimeout(() => setShareMsg(""), 4000);
  }

  function openVideo(query: string) {
    setVideoQuery(query);
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

      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <div ref={stickyHeaderRef} style={{
        padding: "20px 16px 12px",
        borderBottom: `1px solid ${T.borderSubtle}`,
        position: "sticky", top: 0,
        backgroundColor: T.bg, zIndex: 100,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <h1 style={{
            margin: 0, fontSize: "22px", fontWeight: 800,
            letterSpacing: "-0.5px", color: T.textPrimary,
          }}>
            🥋 JJ Game Plan
          </h1>
          {/* Belt badge */}
          <div style={{
            backgroundColor: currentBelt.bg,
            border: `1px solid ${currentBelt.color}44`,
            borderRadius: "20px", padding: "4px 10px",
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "12px", fontWeight: 700, color: currentBelt.color,
          }}>
            {currentBelt.emoji} {currentBelt.name}
          </div>
        </div>

        {/* ── Pill Tab Bar ── */}
        <div style={{
          display: "flex", gap: "2px",
          backgroundColor: "rgba(255,255,255,0.05)",
          padding: "3px", borderRadius: "10px",
          border: `1px solid ${T.borderSubtle}`,
        }}>
          {(["gameplan", "taplist", "timer"] as Tab[]).map((tab) => {
            const labels: Record<Tab, string> = {
              taplist: "🥋 Taps", gameplan: "🔗 Plan", timer: "⏱️ Timer"
            };
            const isActive = activeTab === tab;
            return (
              <button key={tab} onClick={() => { setActiveTab(tab); }}
                style={{
                  flex: 1, padding: "8px 4px", fontSize: "12px",
                  fontWeight: isActive ? 700 : 500, fontFamily: "inherit",
                  cursor: "pointer", border: "none", borderRadius: "8px",
                  backgroundColor: isActive ? T.elevated : "transparent",
                  color: isActive ? T.textPrimary : T.textTertiary,
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.5)" : "none",
                  WebkitTapHighlightColor: "transparent", whiteSpace: "nowrap",
                }}>
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
          {/* Stats bar */}
          <div style={{
            padding: "14px 16px",
            borderBottom: `1px solid ${T.borderSubtle}`,
            display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Streak + Belt row */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                {streak > 0 && (
                  <div style={{
                    backgroundColor: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.3)",
                    borderRadius: "20px", padding: "3px 10px",
                    fontSize: "12px", fontWeight: 700, color: "#fb923c",
                    display: "flex", alignItems: "center", gap: "4px",
                  }}>
                    🔥 {streak} day streak
                  </div>
                )}
              </div>
              {/* Progress numbers */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                <span style={{ color: T.red, fontWeight: 700, fontSize: "15px" }}>
                  {totalCollected}<span style={{ color: T.textTertiary, fontSize: "13px", fontWeight: 400 }}>/{SUBMISSIONS.length}</span>
                </span>
                <span style={{ color: T.textTertiary, fontSize: "12px" }}>
                  {totalTaps} tap{totalTaps !== 1 ? "s" : ""} logged
                </span>
                <span style={{ color: T.textDisabled, fontSize: "12px", marginLeft: "auto" }}>{progressPct}%</span>
              </div>
              {/* Progress bar */}
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
              Share 📤
            </button>
          </div>

          {/* Share confirmation */}
          {shareMsg && (
            <div style={{
              margin: "8px 16px",
              backgroundColor: T.elevated, border: `1px solid ${T.borderDefault}`,
              borderLeft: `3px solid ${T.green}`, borderRadius: "8px",
              padding: "10px 12px", fontSize: "13px", color: T.textSecondary, lineHeight: 1.5,
            }}>
              ✓ Copied to clipboard
            </div>
          )}

          {/* Empty state */}
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
                Tap any submission below to start your collection.<br/>
                <span style={{ color: T.textDisabled }}>{SUBMISSIONS.length} techniques to master.</span>
              </div>
              <div style={{
                marginTop: "20px", display: "inline-flex", alignItems: "center", gap: "6px",
                backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: "20px", padding: "6px 14px",
                fontSize: "12px", color: T.red, fontWeight: 600,
              }}>
                🤍 White belt — collect 6 to unlock Blue
              </div>
            </div>
          )}

          {/* Submission grid */}
          <div style={{ padding: "0 16px" }}>
            {CATEGORIES.map((category) => {
              const subs = SUBMISSIONS.filter((s) => s.category === category);
              const catCollected = subs.filter((s) => (tapData[s.name]?.length ?? 0) > 0).length;
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}
                    className="submissions-grid">
                    {subs.map((sub) => {
                      const taps = tapData[sub.name] ?? [];
                      const count = taps.length;
                      const collected = count > 0;
                      return (
                        <div key={sub.name} onClick={() => openModal(sub.name)}
                          style={{
                            backgroundColor: collected ? "#161620" : T.surface,
                            border: `1px solid ${collected ? T.borderDefault : T.borderSubtle}`,
                            borderLeft: collected ? `3px solid ${T.red}` : `1px solid ${T.borderSubtle}`,
                            borderRadius: "10px", padding: "12px 12px 10px",
                            cursor: "pointer", position: "relative",
                            boxShadow: collected ? `0 0 0 1px rgba(220,38,38,0.08), 0 2px 12px rgba(0,0,0,0.4)` : "none",
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
                                openVideo(sub.name);
                              }}
                              style={{
                                background: "none", border: "none", padding: "4px",
                                fontSize: "15px", opacity: 0.65, cursor: "pointer",
                                lineHeight: 1, WebkitTapHighlightColor: "transparent",
                                borderRadius: "4px",
                              }}
                              title={`Watch ${sub.name} tutorial`}
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
      )}

      {/* ══════════════════════════════════════════
          GAME PLAN TAB
      ══════════════════════════════════════════ */}
      {activeTab === "gameplan" && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", flexDirection: "column", backgroundColor: T.bg,
        }}>
          <div style={{ flexShrink: 0, height: `${headerHeight}px` }} />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <GamePlanFlow openVideo={openVideo} />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TIMER TAB
      ══════════════════════════════════════════ */}
      {activeTab === "timer" && <RollTimer />}

      {/* ── Log Tap Modal ──────────────────────────────────────────────── */}
      {modalSub && (
        <div onClick={closeModal} style={{
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
              Log a tap! 🥋
            </h2>
            <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: T.red, fontWeight: 700 }}>{modalSub}</p>

            {/* Existing tap history with delete */}
            {modalSub && (tapData[modalSub]?.length ?? 0) > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: T.textTertiary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Logged taps
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px", maxHeight: "120px", overflowY: "auto" }}>
                  {(tapData[modalSub] ?? []).map((entry, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      backgroundColor: T.surface, border: `1px solid ${T.borderSubtle}`,
                      borderRadius: "8px", padding: "6px 10px",
                    }}>
                      <div>
                        <span style={{ fontSize: "13px", color: T.textPrimary, fontWeight: 600 }}>{entry.date}</span>
                        {entry.note && <span style={{ fontSize: "11px", color: T.textTertiary, marginLeft: "8px" }}>{entry.note}</span>}
                      </div>
                      <button
                        onClick={() => deleteTap(modalSub!, i)}
                        style={{
                          background: "none", border: "none", color: "#6b7280",
                          fontSize: "16px", cursor: "pointer", padding: "2px 6px",
                          lineHeight: 1, borderRadius: "4px", flexShrink: 0,
                          fontFamily: "inherit",
                        }}
                        title="Remove this tap"
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
            <input type="date" value={modalDate} onChange={(e) => setModalDate(e.target.value)}
              style={{
                width: "100%", backgroundColor: T.surface, border: `1px solid ${T.borderDefault}`,
                borderRadius: "8px", padding: "9px 10px", color: T.textPrimary,
                fontSize: "14px", marginBottom: "16px", fontFamily: "inherit", boxSizing: "border-box",
              }} />
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: T.textTertiary, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              Note (optional)
            </label>
            <textarea value={modalNote} onChange={(e) => setModalNote(e.target.value)}
              placeholder="How'd you get it? From guard? Fast tap?"
              rows={3}
              style={{
                width: "100%", backgroundColor: T.surface, border: `1px solid ${T.borderDefault}`,
                borderRadius: "8px", padding: "9px 10px", color: T.textPrimary,
                fontSize: "14px", fontFamily: "inherit", resize: "none",
                marginBottom: "20px", boxSizing: "border-box",
              }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={closeModal} style={{
                flex: 1, backgroundColor: T.surface, color: T.textTertiary,
                border: `1px solid ${T.borderDefault}`, borderRadius: "10px",
                padding: "13px", fontSize: "15px", fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", WebkitTapHighlightColor: "transparent",
              }}>
                Cancel
              </button>
              <button onClick={confirmTap} style={{
                flex: 2, background: `linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)`,
                color: "#fff", border: "none", borderRadius: "10px",
                padding: "13px", fontSize: "15px", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 0 20px rgba(220,38,38,0.4)", WebkitTapHighlightColor: "transparent",
              }}>
                Confirm Tap ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Video Modal ─────────────────────────────────────────────────── */}
      <VideoModal query={videoQuery} onClose={() => setVideoQuery(null)} />

      {/* ── Belt Unlock Toast ──────────────────────────────────────────── */}
      {beltUnlock && <BeltUnlockToast belt={beltUnlock} onDismiss={() => setBeltUnlock(null)} />}

      {/* ── Professor Max ──────────────────────────────────────────────── */}
      {profMounted && <ProfessorMax visible={profVisible} onDismiss={() => setProfVisible(false)} />}

      {/* Styles */}
      <style>{`
        @media (min-width: 480px) {
          .submissions-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 768px) {
          .submissions-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }
        button:active { transform: scale(0.97); }
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 2px; }
        textarea::placeholder, input::placeholder { color: #4b5563; }
      `}</style>
    </div>
  );
}

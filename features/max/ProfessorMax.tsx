"use client";

import { useEffect, useState } from "react";
import { T } from "@/lib/theme";

const PROFESSOR_QUOTES = [
  "Breathe before you move. A panicked grip is a gift.",
  "If the position feels messy, fix the hips before you hunt a finish.",
  "Win the inch. Big heroics usually give the spot back.",
  "Stay heavy. If they can inhale easily, you are just visiting.",
  "Count the hands. Yours, theirs, and the one that is about to frame.",
  "A good frame is a wall. A lazy frame is a suggestion.",
  "Finish the move you started. Half-attempts do not build a game.",
  "Stuck? Shrink it: hips, then grips, then the finish.",
  "Tap, ask what they did, and try it back. That is the cheap tuition.",
  "The mat remembers what you repeat. Make the repeats worth keeping.",
];

export default function ProfessorMax({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const [quote] = useState(() => PROFESSOR_QUOTES[Math.floor(Math.random() * PROFESSOR_QUOTES.length)]);
  const [blink, setBlink] = useState(false);

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
          <div style={{
            position: "absolute", bottom: "-7px", right: "26px",
            width: 0, height: 0,
            borderLeft: "7px solid transparent",
            borderRight: "7px solid transparent",
            borderTop: "7px solid rgba(147,51,234,0.4)",
          }} />
        </div>

        <div style={{
          width: 72, height: 72,
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid #9333ea",
          boxShadow: "0 0 16px rgba(147,51,234,0.35), 0 4px 12px rgba(0,0,0,0.5)",
          backgroundColor: "#0f0f1a",
          flexShrink: 0,
        }}>
          <svg width="72" height="72" viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="72" height="72" fill="#0f0f1a"/>
            <g className="prof-body">
              <polygon points="20,44 52,44 50,72 22,72" fill="#d4d4e0"/>
              <polygon points="36,48 20,44 24,44" fill="#6b7280"/>
              <polygon points="36,48 52,44 48,44" fill="#6b7280"/>
              <rect x="20" y="58" width="32" height="5" rx="1" fill="#0a0a0a"/>
              <rect x="20" y="59" width="32" height="1.5" fill="#222"/>
            </g>
            <rect x="31" y="37" width="10" height="9" rx="3" fill="#c4a882"/>
            <ellipse cx="22" cy="28" rx="3" ry="5" fill="#b8906a"/>
            <ellipse cx="50" cy="28" rx="3" ry="5" fill="#b8906a"/>
            <ellipse cx="36" cy="27" rx="14" ry="16" fill="#c4a882"/>
            <rect x="22" y="33" width="28" height="11" rx="2" fill="#c4a882"/>
            <ellipse cx="36" cy="14" rx="14" ry="7" fill="#1e1e1e"/>
            <rect x="22" y="12" width="28" height="6" fill="#1e1e1e"/>
            <polygon points="26,14 24,3 29,13" fill="#1e1e1e"/>
            <polygon points="31,12 30,1 34,11" fill="#1e1e1e"/>
            <polygon points="36,11 36,0 39,11" fill="#1e1e1e"/>
            <polygon points="41,12 43,1 45,12" fill="#1e1e1e"/>
            <polygon points="46,14 48,4 50,14" fill="#1e1e1e"/>
            <rect x="25" y="21" width="10" height="2.5" rx="1.2" fill="#1a1a1a" transform="rotate(-7,30,22)"/>
            <rect x="37" y="21" width="10" height="2.5" rx="1.2" fill="#1a1a1a" transform="rotate(7,42,22)"/>
            {blink ? (
              <>
                <rect x="26" y="25" width="8" height="2" rx="1" fill="#1a1a1a"/>
                <rect x="38" y="25" width="8" height="2" rx="1" fill="#1a1a1a"/>
              </>
            ) : (
              <>
                <ellipse cx="30" cy="27" rx="5" ry="4" fill="white"/>
                <ellipse cx="42" cy="27" rx="5" ry="4" fill="white"/>
                <ellipse cx="31" cy="27" rx="3" ry="3" fill="#3b82f6"/>
                <ellipse cx="43" cy="27" rx="3" ry="3" fill="#3b82f6"/>
                <ellipse cx="31.5" cy="27" rx="1.7" ry="1.8" fill="#111"/>
                <ellipse cx="43.5" cy="27" rx="1.7" ry="1.8" fill="#111"/>
                <circle cx="32.2" cy="26" r="0.9" fill="white"/>
                <circle cx="44.2" cy="26" r="0.9" fill="white"/>
              </>
            )}
            <ellipse cx="36" cy="33" rx="2.5" ry="1.5" fill="#b0906a"/>
            <path d="M31 37.5 Q36 39.5 41 37.5" stroke="#8a6650" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </>
  );
}

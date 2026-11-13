"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { T } from "@/lib/theme";

const WORK_TIME = 300;
const REST_TIME = 60;

export default function RollTimer() {
  const [phase, setPhase] = useState<"ready" | "work" | "rest" | "done">("ready");
  const [seconds, setSeconds] = useState(WORK_TIME);
  const [rounds, setRounds] = useState(0);
  const [maxRounds, setMaxRounds] = useState(3);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(phase);
  const secondsRef = useRef(seconds);
  const roundsRef = useRef(rounds);
  const maxRoundsRef = useRef(maxRounds);
  const startTickingRef = useRef<() => void>(() => {});

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
    secondsRef.current = seconds;
    roundsRef.current = rounds;
    maxRoundsRef.current = maxRounds;
  }, [phase, seconds, rounds, maxRounds]);

  useEffect(() => {
    startTickingRef.current = () => {
      stop();
      intervalRef.current = setInterval(() => {
        const next = secondsRef.current - 1;
        if (next > 0) {
          secondsRef.current = next;
          setSeconds(next);
          return;
        }
        stop();
        secondsRef.current = 0;
        setSeconds(0);
        if (phaseRef.current === "work") {
          const newRounds = roundsRef.current + 1;
          roundsRef.current = newRounds;
          setRounds(newRounds);
          if (newRounds >= maxRoundsRef.current) {
            phaseRef.current = "done";
            setPhase("done");
            return;
          }
          phaseRef.current = "rest";
          setPhase("rest");
          secondsRef.current = REST_TIME;
          setSeconds(REST_TIME);
          if (typeof navigator.vibrate === "function") navigator.vibrate([200, 100, 200]);
          startTickingRef.current();
          return;
        }
        if (phaseRef.current === "rest") {
          phaseRef.current = "work";
          setPhase("work");
          secondsRef.current = WORK_TIME;
          setSeconds(WORK_TIME);
          if (typeof navigator.vibrate === "function") navigator.vibrate([400]);
          startTickingRef.current();
        }
      }, 1000);
    };
    return () => stop();
  }, [stop]);

  const reset = () => {
    stop();
    phaseRef.current = "ready";
    secondsRef.current = WORK_TIME;
    roundsRef.current = 0;
    setPhase("ready");
    setSeconds(WORK_TIME);
    setRounds(0);
  };

  const start = () => {
    reset();
    phaseRef.current = "work";
    secondsRef.current = WORK_TIME;
    roundsRef.current = 0;
    setPhase("work");
    setSeconds(WORK_TIME);
    setRounds(0);
    startTickingRef.current();
  };

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

      <div style={{ display: "flex", gap: "12px" }}>
        {phase === "ready" || phase === "done" ? (
          <button
            onClick={start}
            style={{
              background: `linear-gradient(135deg, ${T.red} 0%, #b91c1c 100%)`,
              color: "#fff", border: "none", borderRadius: "14px",
              padding: "18px 40px", fontSize: "18px", fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 0 24px rgba(220,38,38,0.4)",
              letterSpacing: "-0.3px",
            }}
          >
            {phase === "done" ? "Again" : "Start Rolling"}
          </button>
        ) : (
          <>
            <button
              onClick={reset}
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
              onClick={reset}
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

      {(phase === "ready" || phase === "done") && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: T.textDisabled, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
            Rounds
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[2, 3, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => { maxRoundsRef.current = n; setMaxRounds(n); }}
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

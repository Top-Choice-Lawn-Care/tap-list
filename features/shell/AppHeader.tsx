"use client";

import type { RefObject } from "react";
import { T } from "@/lib/theme";
import type { Tab } from "@/lib/types";

const TABS: { id: Tab; label: string }[] = [
  { id: "gameplan", label: "🔗 Plan" },
  { id: "taplist", label: "🥋 Taps" },
  { id: "timer", label: "⏱️ Timer" },
];

export default function AppHeader({
  headerRef,
  activeTab,
  onChangeTab,
  showSignIn,
  email,
  onSignIn,
  onSignOut,
}: {
  headerRef: RefObject<HTMLDivElement | null>;
  activeTab: Tab;
  onChangeTab: (tab: Tab) => void;
  showSignIn: boolean;
  email: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
}) {
  return (
    <div ref={headerRef} style={{
      padding: "20px 16px 12px",
      borderBottom: `1px solid ${T.borderSubtle}`,
      position: "sticky", top: 0,
      backgroundColor: T.bg, zIndex: 100,
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", gap: "12px" }}>
        <h1 style={{
          margin: 0, fontSize: "22px", fontWeight: 800,
          letterSpacing: "-0.5px", color: T.textPrimary,
        }}>
          🥋 JJ Game Plan
        </h1>
        {email ? (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
            <span style={{ fontSize: "10px", color: T.textTertiary, maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {email}
            </span>
            <button
              onClick={onSignOut}
              style={{
                background: "none", border: "none", color: T.textTertiary,
                fontSize: "10px", cursor: "pointer", fontFamily: "inherit",
                textDecoration: "underline", padding: 0,
              }}
            >
              Sign out
            </button>
          </div>
        ) : showSignIn ? (
          <button
            onClick={onSignIn}
            style={{
              backgroundColor: T.elevated, border: `1px solid ${T.borderDefault}`,
              borderRadius: "6px", padding: "4px 10px",
              fontSize: "11px", fontWeight: 600, color: T.textSecondary,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Sign in
          </button>
        ) : null}
      </div>

      <div style={{
        display: "flex", gap: "2px",
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: "3px", borderRadius: "10px",
        border: `1px solid ${T.borderSubtle}`,
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => onChangeTab(tab.id)}
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
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

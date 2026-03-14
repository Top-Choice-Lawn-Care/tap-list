"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

const T = {
  bg: "#09090d",
  surface: "#131318",
  elevated: "#1c1c24",
  modal: "#232329",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderDefault: "rgba(255,255,255,0.09)",
  textPrimary: "#e8e8ea",
  textSecondary: "#9ca3af",
  textTertiary: "#6b7280",
  red: "#dc2626",
};

type Props = {
  supabase: SupabaseClient;
  onClose: () => void;
};

export default function AuthModal({ supabase, onClose }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.82)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 300, padding: "16px", backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: T.modal, border: `1px solid ${T.borderDefault}`,
          borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "360px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        }}
      >
        <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 800, color: T.textPrimary }}>
          {mode === "signin" ? "Sign In" : "Create Account"} 🥋
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: "13px", color: T.textTertiary }}>
          Save your taps to the cloud
        </p>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "11px", borderRadius: "10px",
            backgroundColor: T.surface, border: `1px solid ${T.borderDefault}`,
            color: T.textPrimary, fontSize: "14px", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            marginBottom: "16px", display: "flex", alignItems: "center",
            justifyContent: "center", gap: "8px", boxSizing: "border-box",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.01 24.01 0 000 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>

        <div style={{
          display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px",
        }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: T.borderDefault }} />
          <span style={{ fontSize: "11px", color: T.textTertiary }}>or</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: T.borderDefault }} />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            style={{
              width: "100%", backgroundColor: T.surface, border: `1px solid ${T.borderDefault}`,
              borderRadius: "8px", padding: "10px", color: T.textPrimary,
              fontSize: "14px", marginBottom: "10px", fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={6}
            style={{
              width: "100%", backgroundColor: T.surface, border: `1px solid ${T.borderDefault}`,
              borderRadius: "8px", padding: "10px", color: T.textPrimary,
              fontSize: "14px", marginBottom: "16px", fontFamily: "inherit", boxSizing: "border-box",
            }}
          />
          {error && (
            <div style={{
              fontSize: "12px", color: T.red, marginBottom: "12px",
              backgroundColor: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "8px", padding: "8px 10px",
            }}>
              {error}
            </div>
          )}
          <button
            type="submit" disabled={loading}
            style={{
              width: "100%", background: `linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)`,
              color: "#fff", border: "none", borderRadius: "10px",
              padding: "12px", fontSize: "15px", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
              opacity: loading ? 0.6 : 1, boxSizing: "border-box",
            }}
          >
            {loading ? "..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "14px" }}>
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
            style={{
              background: "none", border: "none", color: T.textTertiary,
              fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
              textDecoration: "underline",
            }}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

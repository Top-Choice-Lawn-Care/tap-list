"use client";

import { VIDEO_IDS } from "@/lib/submissions";
import { T } from "@/lib/theme";

export default function VideoModal({ query, onClose }: { query: string | null; onClose: () => void }) {
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
            aria-label="Close video"
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

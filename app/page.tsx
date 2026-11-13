"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import AppHeader from "@/features/shell/AppHeader";
import ProfessorMax from "@/features/max/ProfessorMax";
import AuthModal from "@/features/profile/AuthModal";
import { useCloudSync } from "@/features/profile/useCloudSync";
import RollTimer from "@/features/roll/RollTimer";
import LogTapModal from "@/features/taps/LogTapModal";
import TapList from "@/features/taps/TapList";
import { useTapLog } from "@/features/taps/useTapLog";
import VideoModal from "@/features/video/VideoModal";
import { T } from "@/lib/theme";
import type { Tab } from "@/lib/types";

const GamePlanFlow = dynamic(() => import("@/features/tree/GamePlanFlow"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6b7280", fontSize: "14px" }}>
      Loading game plan…
    </div>
  ),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("gameplan");
  const [modalSub, setModalSub] = useState<string | null>(null);
  const [videoQuery, setVideoQuery] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [profVisible, setProfVisible] = useState(false);
  const [profMounted, setProfMounted] = useState(false);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(120);

  const { tapData, hydrated, addTap, deleteTap, replaceTapData } = useTapLog();
  const cloud = useCloudSync(replaceTapData);

  useEffect(() => {
    const show = setTimeout(() => { setProfMounted(true); setProfVisible(true); }, 800);
    const hide = setTimeout(() => setProfVisible(false), 5800);
    const unmount = setTimeout(() => setProfMounted(false), 6200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      clearTimeout(unmount);
    };
  }, []);

  useEffect(() => {
    const el = stickyHeaderRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [hydrated]);

  if (!hydrated) return null;

  function confirmTap(date: string, note: string) {
    if (!modalSub) return;
    addTap(modalSub, date, note);
    cloud.syncAdd(modalSub, date, note);
    setModalSub(null);
  }

  function removeTap(index: number) {
    if (!modalSub) return;
    const removed = deleteTap(modalSub, index);
    if (removed) cloud.syncDelete(modalSub, removed.date, removed.note);
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: T.bg,
      color: T.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: "0 0 32px 0",
    }}>
      <AppHeader
        headerRef={stickyHeaderRef}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        showSignIn={cloud.configured}
        email={cloud.user?.email ?? null}
        onSignIn={() => { if (cloud.supabase) setShowAuthModal(true); }}
        onSignOut={() => { void cloud.signOut(); }}
      />

      {activeTab === "taplist" && (
        <TapList tapData={tapData} onOpen={setModalSub} onOpenVideo={setVideoQuery} />
      )}

      {activeTab === "gameplan" && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", flexDirection: "column", backgroundColor: T.bg,
        }}>
          <div style={{ flexShrink: 0, height: `${headerHeight}px` }} />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <GamePlanFlow openVideo={setVideoQuery} />
          </div>
        </div>
      )}

      {activeTab === "timer" && <RollTimer />}

      <LogTapModal
        submissionName={modalSub}
        entries={modalSub ? (tapData[modalSub] ?? []) : []}
        onClose={() => setModalSub(null)}
        onConfirm={confirmTap}
        onDelete={removeTap}
      />
      <VideoModal query={videoQuery} onClose={() => setVideoQuery(null)} />
      {profMounted && <ProfessorMax visible={profVisible} onDismiss={() => setProfVisible(false)} />}
      {showAuthModal && cloud.supabase && (
        <AuthModal supabase={cloud.supabase} onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

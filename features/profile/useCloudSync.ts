"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { parseTapData, STORAGE_KEY } from "@/lib/taps";
import type { TapData } from "@/lib/types";
import { migrateLocalTaps, syncAddTap, syncDeleteTap } from "./tapSync";

type CloudSync = {
  configured: boolean;
  supabase: SupabaseClient | null;
  user: User | null;
  signOut: () => Promise<void>;
  syncAdd: (submissionName: string, date: string, note: string) => void;
  syncDelete: (submissionName: string, date: string, note: string) => void;
};

/**
 * Email/password and Google sign-in, plus localStorage → cloud migration.
 * With no Supabase env vars this stays idle and the tap log remains on-device.
 */
export function useCloudSync(setTapData: (data: TapData) => void): CloudSync {
  const configured = isSupabaseConfigured();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const clientRef = useRef<SupabaseClient | null>(null);
  const userRef = useRef<User | null>(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!configured) return;
    const client = createClient();
    if (!client) return;
    clientRef.current = client;
    setSupabase(client);

    let unsubscribe = () => {};
    try {
      const { data } = client.auth.onAuthStateChange(async (event, session) => {
        const nextUser = session?.user ?? null;
        userRef.current = nextUser;
        setUser(nextUser);

        if (!nextUser || (event !== "SIGNED_IN" && event !== "INITIAL_SESSION")) return;
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;
        try {
          let localData: TapData = {};
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) localData = parseTapData(raw);
          } catch {
            localData = {};
          }
        const merged = await migrateLocalTaps(client, nextUser.id, localData);
        setTapData(merged);
        } catch {
          // Keep the on-device log if the network or project is unavailable.
        } finally {
          isSyncingRef.current = false;
        }
      });
      unsubscribe = () => data.subscription.unsubscribe();
    } catch {
      return;
    }

    return unsubscribe;
  }, [configured, setTapData]);

  const signOut = useCallback(async () => {
    userRef.current = null;
    if (!clientRef.current) return;
    await clientRef.current.auth.signOut();
    setUser(null);
  }, []);

  const syncAdd = useCallback((submissionName: string, date: string, note: string) => {
    const client = clientRef.current;
    const currentUser = userRef.current;
    if (!client || !currentUser) return;
    void syncAddTap(client, currentUser.id, submissionName, date, note).catch(() => {});
  }, []);

  const syncDelete = useCallback((submissionName: string, date: string, note: string) => {
    const client = clientRef.current;
    if (!client || !userRef.current) return;
    void syncDeleteTap(client, submissionName, date, note).catch(() => {});
  }, []);

  return { configured, supabase, user, signOut, syncAdd, syncDelete };
}

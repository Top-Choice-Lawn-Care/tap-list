import type { SupabaseClient } from "@supabase/supabase-js";
import type { TapData } from "@/lib/types";

type TapRow = {
  id?: string;
  submission_name: string;
  date: string;
  note: string | null;
};

export function rowsToTapData(rows: TapRow[]): TapData {
  const data: TapData = {};
  for (const row of rows) {
    if (!data[row.submission_name]) data[row.submission_name] = [];
    data[row.submission_name].push({ date: row.date, note: row.note || "" });
  }
  return data;
}

export async function fetchSupabaseTaps(supabase: SupabaseClient): Promise<TapData> {
  const { data, error } = await supabase.from("taps").select("submission_name, date, note");
  if (error) throw error;
  return data ? rowsToTapData(data) : {};
}

/** Upload local taps that are not already in the cloud, then return the merged log. */
export async function migrateLocalTaps(
  supabase: SupabaseClient,
  userId: string,
  localData: TapData,
): Promise<TapData> {
  const remoteTaps = await fetchSupabaseTaps(supabase);
  const inserts: { user_id: string; submission_name: string; date: string; note: string }[] = [];

  for (const [name, entries] of Object.entries(localData)) {
    const remoteEntries = remoteTaps[name] || [];
    for (const entry of entries) {
      const isDupe = remoteEntries.some((remote) => remote.date === entry.date && remote.note === entry.note);
      if (!isDupe) {
        inserts.push({
          user_id: userId,
          submission_name: name,
          date: entry.date,
          note: entry.note,
        });
      }
    }
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from("taps").insert(inserts);
    if (error) throw error;
  }

  return fetchSupabaseTaps(supabase);
}

export async function syncAddTap(
  supabase: SupabaseClient,
  userId: string,
  submissionName: string,
  date: string,
  note: string,
): Promise<void> {
  const { error } = await supabase.from("taps").insert({
    user_id: userId,
    submission_name: submissionName,
    date,
    note,
  });
  if (error) throw error;
}

export async function syncDeleteTap(
  supabase: SupabaseClient,
  submissionName: string,
  date: string,
  note: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("taps")
    .select("id")
    .eq("submission_name", submissionName)
    .eq("date", date)
    .eq("note", note)
    .limit(1);
  if (error) throw error;
  if (data && data.length > 0) {
    const { error: deleteError } = await supabase.from("taps").delete().eq("id", data[0].id);
    if (deleteError) throw deleteError;
  }
}

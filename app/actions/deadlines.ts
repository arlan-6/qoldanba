"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { parseIcsEvents, detectEventType, parseIcsDate } from "@/lib/ics";

export async function syncDeadlines(
  icsUrl: string,
  revalidate: boolean = true,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  try {
    try {
      const parsed = new URL(icsUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return { error: "Invalid protocol" };
      }
    } catch {
      return { error: "Invalid URL" };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    let res: Response;
    try {
      res = await fetch(icsUrl, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!res.ok) throw new Error("Failed to fetch ICS");
    const icsText = await res.text();
    const events = parseIcsEvents(icsText);

    if (events.length === 0) return { count: 0 };

    const rows = events
      .filter((ev) => !!!ev.SUMMARY?.toLowerCase().includes("attendance")) // Skip events with 'Attendance' in the title
      .map((ev) => {
        const categories = ev.CATEGORIES ?? "";
        const [subject, lecturer] = categories.split("|").map((s) => s.trim());
        const title = ev.SUMMARY ?? "Untitled";
        const eventType = detectEventType(title);

        return {
          user_id: user.id,
          ics_uid: ev.UID,
          source: "lms",
          title,
          description: ev.DESCRIPTION || null,
          event_type: eventType,
          subject: subject || null,
          lecturer: lecturer || null,
          start_at: parseIcsDate(ev.DTSTART),
          end_at: parseIcsDate(ev.DTEND),
          ics_last_modified: ev["LAST-MODIFIED"]
            ? parseIcsDate(ev["LAST-MODIFIED"])
            : null,
          ics_dtstamp: ev.DTSTAMP ? parseIcsDate(ev.DTSTAMP) : null,
          raw_vevent: ev.__raw,
        };
      })
      .filter((row) => {
        if (!row.end_at) return true; // Keep if no end date
        return new Date(row.end_at) > new Date(); // Keep only future deadlines
      });

    const { error } = await supabase
      .from("deadlines")
      .upsert(rows, { onConflict: "user_id, ics_uid" });

    if (error) throw error;

    // Cleanup: Delete deadlines that are already in the past
    // We do this after upsert to ensure even if the ICS had them, they get removed if they are now past.
    // (Though the filter above prevents new ones, this cleans old ones).
    await supabase
      .from("deadlines")
      .delete()
      .lt("end_at", new Date().toISOString())
      .eq("user_id", user.id); // Safety check for user

    if (revalidate) {
      revalidatePath("/my");
      revalidateTag(`deadlines-${user.id}`, "max");
    }

    // Fetch fresh deadlines to return to the UI (bypassing request memoization via unique query)
    const { data: freshDeadlines } = await supabase
      .from("deadlines")
      .select("*")
      .eq("user_id", user.id)
      .gte("end_at", new Date().toISOString()) // Also acts as a cache buster due to varying timestamp
      .order("end_at", { ascending: true });

    return { count: rows.length, deadlines: freshDeadlines || [] };
  } catch (error: any) {
    console.error("Sync error:", error);
    return { error: error.message };
  }
}

export async function getDeadlines() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: deadlines, error } = await supabase
    .from("deadlines")
    .select("*")
    .eq("user_id", user.id)
    .order("end_at", { ascending: true });

  if (error) {
    console.error("Error fetching deadlines:", error);
    return [];
  }

  return deadlines;
}

export async function updateDeadline(id: string, updates: any) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("deadlines")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating deadline:", error);
    throw new Error("Failed to update deadline");
  }

  revalidatePath("/my");
  return { success: true };
}

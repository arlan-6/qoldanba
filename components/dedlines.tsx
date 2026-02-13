"use client";
import React from "react";
import { cn } from "@/lib/utils";
import DeadlinesCard from "./deadlines-card";
import DeadlinesHeader from "./deadlines/deadlines-header";
import ViewTypeToggle from "./deadlines/view-type-toggle";
import DeadlinesFilters from "./deadlines/deadlines-filters";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";

const getStorageKey = (userId?: string) =>
  `qoldanba:deadlines:last-viewed:${userId ?? "anonymous"}`;

type DeadlinesCache = {
  updatedAt: number;
  data: any[];
};

const readCacheFromCookie = (key: string): DeadlinesCache | null => {
  try {
    const encodedKey = `${encodeURIComponent(key)}=`;
    const entry = document.cookie
      .split("; ")
      .find((row) => row.startsWith(encodedKey));

    if (!entry) return null;

    const encodedValue = entry.slice(encodedKey.length);
    const decodedValue = decodeURIComponent(encodedValue);
    return JSON.parse(decodedValue) as DeadlinesCache;
  } catch {
    return null;
  }
};

const writeCacheToCookie = (key: string, cache: DeadlinesCache) => {
  try {
    const value = encodeURIComponent(JSON.stringify(cache));
    document.cookie = `${encodeURIComponent(key)}=${value}; max-age=${60 * 60}; path=/; SameSite=Lax`;
  } catch {}
};

const filterUpcomingDeadlines = (items: any[]) => {
  const now = Date.now();
  return (items || []).filter((item) => {
    if (!item?.end_at) return true;
    const endTime = new Date(item.end_at).getTime();
    return Number.isFinite(endTime) ? endTime >= now : true;
  });
};

const Deadlines = ({
  deadlines = [],
  userId,
  icsUrl,
}: {
  deadlines?: any[];
  userId?: string;
  icsUrl?: string;
}) => {
  const supabase = React.useMemo(() => createClient(), []);
  const [showExams, setShowExams] = React.useState(true);
  const [showAssignments, setShowAssignments] = React.useState(true);
  const [showQuizzes, setShowQuizzes] = React.useState(true);
  const [showDeadlines, setShowDeadlines] = React.useState(true);
  const [viewType, setViewType] = React.useState<"list" | "card">("card");
  const [cachedDeadlines, setCachedDeadlines] = React.useState<any[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);

  const storageKey = React.useMemo(() => getStorageKey(userId), [userId]);

  React.useEffect(() => {
    const parsed = readCacheFromCookie(storageKey);
    if (!parsed || !Array.isArray(parsed.data) || parsed.data.length === 0) {
      return;
    }

    const upcoming = filterUpcomingDeadlines(parsed.data);
    setCachedDeadlines(upcoming);
  }, [storageKey]);

  React.useEffect(() => {
    if (!userId) return;

    let active = true;

    const fetchDeadlines = async () => {
      try {
        if (active) {
          setIsLoading(true);
        }

        const loadFromDatabase = async () => {
          const { data, error } = await supabase
            .from("deadlines")
            .select("*")
            .eq("user_id", userId)
            .gte("end_at", new Date().toISOString())
            .order("end_at", { ascending: true });

          if (!active) return;

          if (error) {
            console.error("Error fetching deadlines:", error);
            return;
          }

          const nextDeadlines = filterUpcomingDeadlines(data ?? []);
          setCachedDeadlines(nextDeadlines);
          const nextUpdatedAt = Date.now();
          writeCacheToCookie(storageKey, {
            updatedAt: nextUpdatedAt,
            data: nextDeadlines,
          });
        };

        // 1) Always read latest from DB first (source of truth)
        await loadFromDatabase();

        // 2) Always sync from ICS in background
        if (icsUrl) {
          await fetch("/api/sync-ics", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ icsUrl }),
          });

          // 3) Re-read DB after sync so UI gets synced data
          await loadFromDatabase();
        }
      } catch (error) {
        if (!active) return;
        console.error("Unexpected deadlines fetch error:", error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchDeadlines();

    return () => {
      active = false;
    };
  }, [icsUrl, storageKey, supabase, userId]);

  React.useEffect(() => {
    if (!deadlines || deadlines.length === 0) return;
    const upcoming = filterUpcomingDeadlines(deadlines);
    setCachedDeadlines(upcoming);
    const nextUpdatedAt = Date.now();
    writeCacheToCookie(storageKey, {
      updatedAt: nextUpdatedAt,
      data: upcoming,
    });
  }, [deadlines, storageKey]);

  const effectiveDeadlines =
    deadlines && deadlines.length > 0
      ? filterUpcomingDeadlines(deadlines)
      : cachedDeadlines || [];

  if (isLoading && effectiveDeadlines.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading deadlines...
      </div>
    );
  }

  if (!effectiveDeadlines || effectiveDeadlines.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No deadlines found.
      </div>
    );
  }

  const onFilterChange = (value: string[]) => {
    setShowExams(value.includes("exam"));
    setShowAssignments(value.includes("assignment"));
    setShowQuizzes(value.includes("quiz"));
    setShowDeadlines(value.includes("deadline"));
  };

  const filteredDeadlines = effectiveDeadlines.filter((deadline) => {
    if (deadline.event_type === "exam" && !showExams) return false;
    if (deadline.event_type === "homework" && !showAssignments) return false;
    if (deadline.event_type === "quiz" && !showQuizzes) return false;
    if (deadline.event_type === "deadline" && !showDeadlines) return false;
    return true;
  });

  return (
    <div className="p-6 pt-2">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <DeadlinesHeader count={filteredDeadlines.length} />

        <div className="flex flex-wrap items-center gap-2 pt-4">
          <ViewTypeToggle viewType={viewType} setViewType={setViewType} />
          <DeadlinesFilters
            onFilterChange={onFilterChange}
            showExams={showExams}
            showAssignments={showAssignments}
            showQuizzes={showQuizzes}
            showDeadlines={showDeadlines}
          />
        </div>
      </div>

      <div
        className={cn(
          viewType === "card"
            ? "grid gap-3 md:grid-cols-2 lg:grid-cols-4"
            : "grid lg:grid-cols-2 gap-2",
        )}
      >
        {filteredDeadlines.length > 0 ? (
          filteredDeadlines
            .sort(
              (a, b) =>
                new Date(a.end_at).getTime() - new Date(b.end_at).getTime(),
            )
            .map((deadline) => (
              <DeadlinesCard
                key={deadline.id}
                deadline={deadline}
                viewType={viewType}
              />
            ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full text-center py-10 text-muted-foreground"
          >
            No deadlines {":)"}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Deadlines;

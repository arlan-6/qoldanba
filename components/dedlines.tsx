"use client";
import React from "react";
import { cn } from "@/lib/utils";
import DeadlinesCard from "./deadlines-card";
import DeadlinesHeader from "./deadlines/deadlines-header";
import ViewTypeToggle from "./deadlines/view-type-toggle";
import DeadlinesFilters from "./deadlines/deadlines-filters";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";

const ONE_HOUR_MS = 60 * 60 * 1000;

const getStorageKey = (userId?: string) =>
  `qoldanba:deadlines:last-viewed:${userId ?? "anonymous"}`;

type DeadlinesCache = {
  updatedAt: number;
  data: any[];
};

const Deadlines = ({
  deadlines = [],
  userId,
}: {
  deadlines?: any[];
  userId?: string;
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
  const [isLoading, setIsLoading] = React.useState(!deadlines.length);

  const storageKey = React.useMemo(() => getStorageKey(userId), [userId]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as DeadlinesCache;
        const isFresh = Date.now() - parsed.updatedAt < ONE_HOUR_MS;
        if (Array.isArray(parsed.data) && parsed.data.length > 0) {
          setCachedDeadlines(parsed.data);
          if (isFresh) {
            setIsLoading(false);
          }
        }
      }
    } catch {}
  }, [storageKey]);

  React.useEffect(() => {
    if (!userId) return;

    let active = true;

    const fetchDeadlines = async () => {
      try {
        const raw = localStorage.getItem(storageKey);
        const parsed = raw ? (JSON.parse(raw) as DeadlinesCache) : null;
        const isFresh =
          parsed?.updatedAt != null &&
          Date.now() - parsed.updatedAt < ONE_HOUR_MS &&
          Array.isArray(parsed.data) &&
          parsed.data.length > 0;

        if (isFresh) {
          if (active) setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("deadlines")
          .select("*")
          .eq("user_id", userId)
          .order("end_at", { ascending: true });

        if (!active) return;

        if (error) {
          console.error("Error fetching deadlines:", error);
          setIsLoading(false);
          return;
        }

        const nextDeadlines = data ?? [];
        setCachedDeadlines(nextDeadlines);
        localStorage.setItem(
          storageKey,
          JSON.stringify({ updatedAt: Date.now(), data: nextDeadlines }),
        );
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
  }, [storageKey, supabase, userId]);

  React.useEffect(() => {
    if (!deadlines || deadlines.length === 0) return;
    setCachedDeadlines(deadlines);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ updatedAt: Date.now(), data: deadlines }),
      );
    } catch {}
  }, [deadlines, storageKey]);

  const effectiveDeadlines =
    deadlines && deadlines.length > 0 ? deadlines : cachedDeadlines || [];

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

"use client";
import React from "react";
import { cn } from "@/lib/utils";
import DeadlinesCard from "./deadlines-card";
import DeadlinesHeader from "./deadlines/deadlines-header";
import ViewTypeToggle from "./deadlines/view-type-toggle";
import DeadlinesFilters from "./deadlines/deadlines-filters";
import { motion } from "motion/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { Eye, EyeOff } from "lucide-react";
import {
  hideDeadline,
  syncDeadlines,
  UnhideDeadline,
} from "@/app/actions/deadlines";
import { toast } from "sonner";
import HiddenDeadlinesToggle from "./deadlines/hidden-deadlines-toggle";
import DashboardCalendar from "./dashboad-calendar";
import { DateRange } from "react-day-picker";

const toUtcDayKey = (date: Date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

const EMPTY_DEADLINES: any[] = [];

const Deadlines = ({
  deadlines,
  icsUrl = "",
}: {
  deadlines?: any[];
  icsUrl?: string;
}) => {
  const incomingDeadlines = deadlines ?? EMPTY_DEADLINES;
  const [showExams, setShowExams] = React.useState(true);
  const [showAssignments, setShowAssignments] = React.useState(true);
  const [showQuizzes, setShowQuizzes] = React.useState(true);
  const [showDeadlines, setShowDeadlines] = React.useState(true);
  const [showHidden, setShowHidden] = React.useState(false);
  const [viewType, setViewType] = React.useState<"list" | "card">("card");
  const [processingId, setProcessingId] = React.useState<string>("");
  const [selectedRange, setSelectedRange] = React.useState<
    DateRange | undefined
  >();
  const [syncedDeadlines, setSyncedDeadlines] = React.useState<any[] | null>(
    null,
  );
  const [hiddenOverrides, setHiddenOverrides] = React.useState<
    Record<string, boolean>
  >({});

  const effectiveDeadlines = syncedDeadlines ?? incomingDeadlines;

  React.useEffect(() => {
    let isMounted = true;

    const syncInBackground = async () => {
      if (!icsUrl) return;

      const result = await syncDeadlines(icsUrl, false);

      if (!isMounted || result?.error) return;
      if (Array.isArray(result.deadlines)) {
        setSyncedDeadlines(result.deadlines);
      }
    };

    void syncInBackground();

    return () => {
      isMounted = false;
    };
  }, [icsUrl]);

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
    const isHidden = hiddenOverrides[deadline.id] ?? Boolean(deadline.hidden);

    if (deadline.event_type === "exam" && !showExams) return false;
    if (deadline.event_type === "homework" && !showAssignments) return false;
    if (deadline.event_type === "quiz" && !showQuizzes) return false;
    if (deadline.event_type === "deadline" && !showDeadlines) return false;
    if (isHidden && !showHidden) return false;

    return true;
  });

  const filteredDeadlines2 = filteredDeadlines.filter((deadline) => {
    const deadlineDate = deadline.end_at ? new Date(deadline.end_at) : null;
    if (selectedRange?.from) {
      if (!deadlineDate || Number.isNaN(deadlineDate.getTime())) return false;

      const deadlineKey = toUtcDayKey(deadlineDate);
      const fromKey = toUtcDayKey(selectedRange.from);
      const toKey = selectedRange.to ? toUtcDayKey(selectedRange.to) : fromKey;

      if (deadlineKey < fromKey || deadlineKey > toKey) return false;
    }
    return true;
  });

  const handleHide = async (id: string) => {
    setProcessingId(id);
    const previousHidden = hiddenOverrides[id];

    setHiddenOverrides((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await hideDeadline(id);

      if (!res?.success) {
        throw new Error("Hide failed");
      }

      toast("Deadline hidden");
    } catch {
      setHiddenOverrides((prev) => {
        const next = { ...prev };
        if (previousHidden === undefined) {
          delete next[id];
        } else {
          next[id] = previousHidden;
        }
        return next;
      });
      toast.error("Failed to hide deadline");
    } finally {
      setProcessingId("");
    }
  };

  const handleReveal = async (id: string) => {
    setProcessingId(id);
    const previousHidden = hiddenOverrides[id];

    setHiddenOverrides((prev) => ({ ...prev, [id]: false }));

    try {
      const res = await UnhideDeadline(id);

      if (!res?.success) {
        throw new Error("Reveal failed");
      }

      toast("Deadline revealed");
    } catch {
      setHiddenOverrides((prev) => {
        const next = { ...prev };
        if (previousHidden === undefined) {
          delete next[id];
        } else {
          next[id] = previousHidden;
        }
        return next;
      });
      toast.error("Failed to reveal deadline");
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="p-6 pt-2 select-none md:select-auto">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <DeadlinesHeader count={filteredDeadlines2.length} />

        <div className="flex flex-wrap items-center gap-2 pt-4">
          <HiddenDeadlinesToggle
            showHidden={showHidden}
            setShowHidden={setShowHidden}
          />
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
            : "grid md:grid-cols-3 lg:grid-cols-5 gap-2",
        )}
      >
        <div
          className={cn(
            viewType === "card" && "col-span-1 row-span-3 ",
            viewType === "list" && "col-span-1 lg:row-span-10 md:row-span-6",
          )}
        >
          <DashboardCalendar
            selectedRange={selectedRange}
            setSelectedRange={setSelectedRange}
            deadlines={filteredDeadlines}
          />
        </div>
        {filteredDeadlines2.length > 0 ? (
          filteredDeadlines2
            .sort(
              (a, b) =>
                new Date(a.end_at).getTime() - new Date(b.end_at).getTime(),
            )
            .map((deadline) => {
              const isHidden =
                hiddenOverrides[deadline.id] ?? Boolean(deadline.hidden);

              return (
                <ContextMenu key={deadline.id}>
                  <ContextMenuTrigger
                    className={cn(
                      viewType == "list" &&
                        "md:col-span-2 lg:col-span-2 lg:row-span-1",
                    )}
                  >
                    <DeadlinesCard
                      isProccessing={processingId == deadline.id}
                      deadline={deadline}
                      viewType={viewType}
                      isHidden={isHidden}
                    />
                  </ContextMenuTrigger>

                  <ContextMenuContent>
                    {!isHidden ? (
                      <ContextMenuItem
                        disabled={processingId == deadline.id}
                        onClick={() => handleHide(deadline.id)}
                      >
                        <EyeOff /> Hide
                      </ContextMenuItem>
                    ) : (
                      <ContextMenuItem
                        disabled={processingId == deadline.id}
                        onClick={() => handleReveal(deadline.id)}
                      >
                        <Eye /> Reveal
                      </ContextMenuItem>
                    )}
                  </ContextMenuContent>
                </ContextMenu>
              );
            })
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

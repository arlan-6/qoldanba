"use client";
import React from "react";
import { cn } from "@/lib/utils";
import DeadlinesCard from "./deadlines-card";
import DeadlinesHeader from "./deadlines/deadlines-header";
import ViewTypeToggle from "./deadlines/view-type-toggle";
import DeadlinesFilters from "./deadlines/deadlines-filters";
import { motion } from "motion/react";

const Deadlines = ({ deadlines = [] }: { deadlines?: any[] }) => {
  const [showExams, setShowExams] = React.useState(true);
  const [showAssignments, setShowAssignments] = React.useState(true);
  const [showQuizzes, setShowQuizzes] = React.useState(true);
  const [showDeadlines, setShowDeadlines] = React.useState(true);
  const [viewType, setViewType] = React.useState<"list" | "card">("card");
  const effectiveDeadlines = deadlines;

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

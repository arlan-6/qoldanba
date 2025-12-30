"use client";
import React from "react";
import {
  LayoutGrid,
  List,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "motion/react";
import Link from "next/link";
import DeadlinesCard from "./deadlines-card";

const Deadlines = ({ deadlines }: { deadlines: any[] }) => {
  const [showExams, setShowExams] = React.useState(true);
  const [showAssignments, setShowAssignments] = React.useState(true);
  const [showQuizzes, setShowQuizzes] = React.useState(true);
  const [showDeadlines, setShowDeadlines] = React.useState(true);
  const [viewType, setViewType] = React.useState<"list" | "card">("card");
  if (!deadlines || deadlines.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No deadlines found.
      </div>
    );
  }

  const onFilterChange = (value: string[]) => {
    // console.log(value);
    setShowExams(value.includes("exam"));
    setShowAssignments(value.includes("assignment"));
    setShowQuizzes(value.includes("quiz"));
    setShowDeadlines(value.includes("deadline"));
  };

  const filteredDeadlines = deadlines.filter((deadline) => {
    if (deadline.event_type === "exam" && !showExams) return false;
    if (deadline.event_type === "homework" && !showAssignments) return false;
    if (deadline.event_type === "quiz" && !showQuizzes) return false;
    if (deadline.event_type === "deadline" && !showDeadlines) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex  flex-wrap items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2 md:gap-6 items-end">
          <h1 className="text-2xl font-bold ">
            Upcoming Deadlines ({filteredDeadlines.length})
          </h1>
          <Link
            className="text-sm line-clamp-1 underline"
            href={"https://lms.astanait.edu.kz/my/"}
          >
            LMS dashboard (click)
          </Link>
        </div>
        <div className="flex items-center gap-2 pt-4">
          <ToggleGroup
            defaultValue={["assignment", "quiz", "deadline", "exam"]}
            type="multiple"
            // variant={"outline"}
            spacing={25}
            onValueChange={onFilterChange}
          >
            <div className=" items-center bg-muted/50 p-1 rounded-lg mr-4 border hidden md:flex">
              <button
                onClick={() => setViewType("list")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewType === "list"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewType("card")}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  viewType === "card"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
            <motion.div
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                // delay: 0.5 * i,
                type: "spring",
                stiffness: 200,
                duration: 0.1,
              }}
              initial={{ scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
            >
              <ToggleGroupItem
                variant={!showDeadlines ? "default" : "outline"}
                className={cn(
                  !showExams && "line-through",
                  "text-md mx-1 md:m-2 cursor-pointer"
                )}
                aria-label="exam"
                value="exam"
              >
                exam
              </ToggleGroupItem>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                // delay: 0.5 * i,
                type: "spring",
                stiffness: 200,
                duration: 0.1,
              }}
              initial={{ scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
            >
              <ToggleGroupItem
                variant={!showDeadlines ? "default" : "outline"}
                className={cn(
                  !showAssignments && "line-through",
                  "text-md mx-1 md:m-2 cursor-pointer"
                )}
                aria-label="assignment"
                value="assignment"
              >
                assignment
              </ToggleGroupItem>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                // delay: 0.5 * i,
                type: "spring",
                stiffness: 200,
                duration: 0.1,
              }}
              initial={{ scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
            >
              <ToggleGroupItem
                variant={!showDeadlines ? "default" : "outline"}
                className={cn(
                  !showQuizzes && "line-through",
                  "text-md mx-1 md:m-2 cursor-pointer"
                )}
                aria-label="quiz"
                value="quiz"
              >
                quiz
              </ToggleGroupItem>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.9 }}
              transition={{
                // delay: 0.5 * i,
                type: "spring",
                stiffness: 200,
                duration: 0.1,
              }}
              initial={{ scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
            >
              <ToggleGroupItem
                variant={!showDeadlines ? "default" : "outline"}
                className={cn(
                  !showDeadlines && "line-through",
                  "text-md mx-1 md:m-2 cursor-pointer"
                )}
                aria-label="deadline"
                value="deadline"
              >
                deadline
              </ToggleGroupItem>
            </motion.div>
          </ToggleGroup>
          <Tooltip>
            <TooltipTrigger asChild className="cursor-help hidden md:block">
              <Badge variant={"outline"}>?</Badge>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="bg-black/70 border p-2 cursor-help"
            >
              <div>
                <p>Filters</p>
                <Badge variant={"default"}>exam</Badge> - Final, Midterm,
                Endterm&nbsp; &nbsp; <br />
                <Badge variant={"default"}>homework</Badge> - Assignment,
                Homework&nbsp; &nbsp; <br />
                <Badge variant={"default"}>quiz</Badge> - Quiz&nbsp; &nbsp;{" "}
                <br />
                <Badge variant={"default"}>deadline</Badge> - Others&nbsp;
                &nbsp; <br />
                {/* <Badge variant={"outline"}>other</Badge> - Other */}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div
        className={cn(
          viewType === "card" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-4" : "",
          filteredDeadlines.length < 0 &&
            viewType === "card" &&
            "md:grid-cols-1 lg:grid-cols-1",
          viewType === "list" ? "flex flex-col gap-4" : "",
          filteredDeadlines.length < 0 &&
            viewType === "list" &&
            "flex flex-col gap-4"
        )}
      >
        {filteredDeadlines.length > 0 ? (
          filteredDeadlines
            .sort(
              (a, b) =>
                new Date(a.end_at).getTime() - new Date(b.end_at).getTime()
            )
            .map((deadline, i) => (
              <DeadlinesCard
                key={deadline.id}
                deadline={deadline}
                viewType={viewType}
              />
            ))
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full text-center"
            >
              No deadlines {":)"}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

function getBadgeVariant(
  type: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (type?.toLowerCase()) {
    case "exam":
      return "default";
    case "assignment":
      return "default";
    case "quiz":
      return "default";
    default:
      return "default";
  }
}

export default Deadlines;

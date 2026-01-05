import React from "react";
import { motion } from "motion/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DeadlinesFiltersProps {
  onFilterChange: (value: string[]) => void;
  showExams: boolean;
  showAssignments: boolean;
  showQuizzes: boolean;
  showDeadlines: boolean;
}

const DeadlinesFilters = ({
  onFilterChange,
  showExams,
  showAssignments,
  showQuizzes,
  showDeadlines,
}: DeadlinesFiltersProps) => {
  return (
    <div className="flex items-center gap-2">
      <ToggleGroup
        defaultValue={["assignment", "quiz", "deadline", "exam"]}
        type="multiple"
        spacing={25}
        onValueChange={onFilterChange}
      >
        <FilterItem
          value="exam"
          label="exam"
          isActive={showExams}
          isStrikethrough={!showExams}
        />
        <FilterItem
          value="assignment"
          label="assignment"
          isActive={showAssignments}
          isStrikethrough={!showAssignments}
        />
        <FilterItem
          value="quiz"
          label="quiz"
          isActive={showQuizzes}
          isStrikethrough={!showQuizzes}
        />
        <FilterItem
          value="deadline"
          label="deadline"
          isActive={showDeadlines}
          isStrikethrough={!showDeadlines}
        />
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
            <Badge variant={"default"}>exam</Badge> - Final, Midterm, Endterm
            <br />
            <Badge variant={"default"}>homework</Badge> - Assignment, Homework
            <br />
            <Badge variant={"default"}>quiz</Badge> - Quiz
            <br />
            <Badge variant={"default"}>deadline</Badge> - Others
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

interface FilterItemProps {
  value: string;
  label: string;
  isActive: boolean;
  isStrikethrough: boolean;
}

const FilterItem = ({
  value,
  label,
  isActive,
  isStrikethrough,
}: FilterItemProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.9 }}
    transition={{
      type: "spring",
      stiffness: 200,
      duration: 0.1,
    }}
    initial={{ scale: 0.8 }}
    animate={{ y: 0, scale: 1 }}
  >
    <ToggleGroupItem
      variant={isActive ? "outline" : "default"} // This was a bit weird in original: variant={!showDeadlines ? "default" : "outline"}
      className={cn(
        isStrikethrough && "line-through",
        "text-sm mx-0.5 md:m-0.5 cursor-pointer"
      )}
      aria-label={label}
      value={value}
    >
      {label}
    </ToggleGroupItem>
  </motion.div>
);

export default DeadlinesFilters;

"use client";

import * as React from "react";
import { useSidebar } from "./animate-ui/components/radix/sidebar";
import { Calendar } from "./ui/calendar";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { colorStyles } from "./show-year-activities";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

type Color =
  | "green"
  | "blue"
  | "red"
  | "gray"
  | "yellow"
  | "purple"
  | "pink"
  | "indigo";
type Activity = {
  academic_year: string;
  course_year: number;
  created_at: string;
  end_date: string;
  id: number;
  name: string;
  program_level: "Bachelor" | "Master" | "Phd";
  start_date: string;
  term: string;
  type: string;
  university: string;
};
export type { Activity };
function dayKey(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isInRangeKey(key: number, fromKey: number, toKey: number) {
  return key >= fromKey && key <= toKey;
}

function isSameDayKey(aKey: number, bKey: number) {
  return aKey === bKey;
}

function colorByType(type: string): Color {
  switch (type) {
    case "study":
      return "gray";
    case "registration":
      return "blue";
    case "midterm":
      return "yellow";
    case "endterm":
      return "yellow";
    case "exam":
      return "red";
    case "final":
      return "purple";
    case "internship":
      return "indigo";
    case "defense":
      return "pink";
    case "break":
      return "blue";
    case "summer":
      return "green";
    default:
      return "blue";
  }
}

const SidebarCalendar = ({ activities }: { activities?: Activity[] }) => {
  const safeActivities = activities ?? [];
  const { state, isMobile } = useSidebar();
  const [typeLegend, setTypeLegend] = React.useState<string[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  const parsedActivities = React.useMemo(() => {
    return safeActivities.map((activity) => {
      const start = new Date(activity.start_date);
      const end = new Date(activity.end_date);
      const startKey = dayKey(start);
      const endKey = dayKey(end);
      return {
        ...activity,
        start,
        end,
        startKey,
        endKey,
        startMonth: start.getMonth() + 1,
        endMonth: end.getMonth() + 1,
        color: colorByType(activity.type),
      };
    });
  }, [safeActivities]);
  // const typeLegend = Array.from(new Set(activities.map((a) => a.type)));
  const handleMonthChange = (date: Date) => {
    // console.log("Month changed to:", date);
    const month = date.getMonth() + 1; // Months are zero-based
    const thisMonthActivities = parsedActivities.filter((activity) => {
      if (activity.type === "study") return false;
      return month == activity.startMonth || month == activity.endMonth;
    });

    const newTypeLegend = Array.from(
      new Set(thisMonthActivities.map((a) => a.type))
    );
    // console.log(newTypeLegend);
    setTypeLegend(newTypeLegend);
  };

  React.useEffect(() => {
    const today = new Date();
    handleMonthChange(today);
  }, [parsedActivities, setTypeLegend]);
  
  React.useEffect(() => {
    setSelectedDate(new Date());
  }, []);

  if (state !== "expanded" && !isMobile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.25 }}
    >
      <Calendar
        mode="single"
        selected={selectedDate ?? undefined}
        onSelect={() => {}}
        onMonthChange={handleMonthChange}
        showOutsideDays={false}
        weekStartsOn={1}
        captionLayout="dropdown"
        className="w-full border-0 p-0 bg-transparent text-sm"
        modifiers={{
          green: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "green" &&
                isInRangeKey(dayKey(d), activity.startKey, activity.endKey)
            ),
          greenStart: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "green" &&
                isSameDayKey(dayKey(d), activity.startKey)
            ),
          greenEnd: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "green" &&
                isSameDayKey(dayKey(d), activity.endKey)
            ),

          blue: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "blue" &&
                isInRangeKey(dayKey(d), activity.startKey, activity.endKey)
            ),
          blueStart: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "blue" &&
                isSameDayKey(dayKey(d), activity.startKey)
            ),
          blueEnd: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "blue" &&
                isSameDayKey(dayKey(d), activity.endKey)
            ),

          red: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "red" &&
                isInRangeKey(dayKey(d), activity.startKey, activity.endKey)
            ),
          redStart: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "red" &&
                isSameDayKey(dayKey(d), activity.startKey)
            ),
          redEnd: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "red" &&
                isSameDayKey(dayKey(d), activity.endKey)
            ),

          yellow: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "yellow" &&
                isInRangeKey(dayKey(d), activity.startKey, activity.endKey)
            ),
          yellowStart: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "yellow" &&
                isSameDayKey(dayKey(d), activity.startKey)
            ),
          yellowEnd: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "yellow" &&
                isSameDayKey(dayKey(d), activity.endKey)
            ),

          purple: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "purple" &&
                isInRangeKey(dayKey(d), activity.startKey, activity.endKey)
            ),
          purpleStart: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "purple" &&
                isSameDayKey(dayKey(d), activity.startKey)
            ),
          purpleEnd: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "purple" &&
                isSameDayKey(dayKey(d), activity.endKey)
            ),

          pink: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "pink" &&
                isInRangeKey(dayKey(d), activity.startKey, activity.endKey)
            ),
          pinkStart: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "pink" &&
                isSameDayKey(dayKey(d), activity.startKey)
            ),
          pinkEnd: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "pink" &&
                isSameDayKey(dayKey(d), activity.endKey)
            ),

          indigo: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "indigo" &&
                isInRangeKey(dayKey(d), activity.startKey, activity.endKey)
            ),
          indigoStart: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "indigo" &&
                isSameDayKey(dayKey(d), activity.startKey)
            ),
          indigoEnd: (d) =>
            parsedActivities.some(
              (activity) =>
                activity.color === "indigo" &&
                isSameDayKey(dayKey(d), activity.endKey)
            ),
        }}
        modifiersClassNames={{
          // middle-of-range styling: NO rounding
          green:
            "bg-green-300/10 border-b-green-500 border-b-2 text-black dark:text-white",
          blue: "bg-blue-300/10 border-b-blue-500 border-b-2 text-black dark:text-white",
          red: "bg-red-300/10 border-b-red-500 border-b-2 text-black dark:text-white",
          yellow:
            "bg-yellow-300/10 border-b-yellow-500 border-b-2 text-black dark:text-white",
          purple:
            "bg-purple-300/10 border-b-purple-500 border-b-2 text-black dark:text-white",
          pink: "bg-pink-300/10 border-b-pink-500 border-b-2 text-black dark:text-white",
          indigo: "bg-indigo-300/10 border-b-indigo-500 border-b-2 text-white",

          // range edges
          greenStart: "rounded-l-md",
          greenEnd: "rounded-r-md",
          blueStart: "rounded-l-md",
          blueEnd: "rounded-r-md",
          redStart: "rounded-l-md",
          redEnd: "rounded-r-md",
          yellowStart: "rounded-l-md",
          yellowEnd: "rounded-r-md",
          purpleStart: "rounded-l-md",
          purpleEnd: "rounded-r-md",
          pinkStart: "rounded-l-md",
          pinkEnd: "rounded-r-md",
          indigoStart: "rounded-l-md",
          indigoEnd: "rounded-r-md",
        }}
      />
      <div className="mt-8 md:mt-0">
        {typeLegend.length > 0 && (
          <ScrollArea>
            <div className="flex gap-2 pt-2">
              {typeLegend.map((type) => {
                const color = colorByType(type);
                const styles = colorStyles[color];
                return (
                  <span
                    key={type}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs cursor-pointer",
                      styles.badge
                    )}
                  >
                    <span
                      className={cn("h-2 w-2 rounded-full ", styles.dot)}
                      aria-hidden
                    />
                    {type}
                  </span>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </motion.div>
  );
};

export default SidebarCalendar;

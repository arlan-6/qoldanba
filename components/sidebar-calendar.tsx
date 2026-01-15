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

function isInRange(date: Date, from: Date, to: Date) {
  const x = dayKey(date);
  return x >= dayKey(from) && x <= dayKey(to);
}

function isSameDay(a: Date, b: Date) {
  return dayKey(a) === dayKey(b);
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

const SidebarCalendar = ({ activities }: { activities: Activity[] }) => {
  const { state, isMobile } = useSidebar();
  const [typeLegend, setTypeLegend] = React.useState<string[]>([]);
  // const typeLegend = Array.from(new Set(activities.map((a) => a.type)));
  const handleMonthChange = (date: Date) => {
    // console.log("Month changed to:", date);
    const month = date.getMonth() + 1; // Months are zero-based
    const thisMonthActivities = activities.filter((activity) => {
      const startMonth = new Date(activity.start_date).getMonth() + 1;
      const endMonth = new Date(activity.end_date).getMonth() + 1;
      if (activity.type === "study") return false;
      return month == startMonth || month == endMonth;
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
  }, [activities, setTypeLegend]);

  if (state !== "expanded" && !isMobile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.25 }}
    >
      <Calendar
        mode="single"
        selected={new Date()}
        onSelect={() => {}}
        onMonthChange={handleMonthChange}
        showOutsideDays={false}
        weekStartsOn={1}
        captionLayout="dropdown"
        className="w-full border-0 p-0 bg-transparent text-sm"
        modifiers={{
          green: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "green" &&
                isInRange(
                  d,
                  new Date(activity.start_date),
                  new Date(activity.end_date)
                )
            ),
          greenStart: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "green" &&
                isSameDay(d, new Date(activity.start_date))
            ),
          greenEnd: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "green" &&
                isSameDay(d, new Date(activity.end_date))
            ),

          blue: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "blue" &&
                isInRange(
                  d,
                  new Date(activity.start_date),
                  new Date(activity.end_date)
                )
            ),
          blueStart: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "blue" &&
                isSameDay(d, new Date(activity.start_date))
            ),
          blueEnd: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "blue" &&
                isSameDay(d, new Date(activity.end_date))
            ),

          red: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "red" &&
                isInRange(
                  d,
                  new Date(activity.start_date),
                  new Date(activity.end_date)
                )
            ),
          redStart: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "red" &&
                isSameDay(d, new Date(activity.start_date))
            ),
          redEnd: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "red" &&
                isSameDay(d, new Date(activity.end_date))
            ),

          yellow: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "yellow" &&
                isInRange(
                  d,
                  new Date(activity.start_date),
                  new Date(activity.end_date)
                )
            ),
          yellowStart: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "yellow" &&
                isSameDay(d, new Date(activity.start_date))
            ),
          yellowEnd: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "yellow" &&
                isSameDay(d, new Date(activity.end_date))
            ),

          purple: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "purple" &&
                isInRange(
                  d,
                  new Date(activity.start_date),
                  new Date(activity.end_date)
                )
            ),
          purpleStart: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "purple" &&
                isSameDay(d, new Date(activity.start_date))
            ),
          purpleEnd: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "purple" &&
                isSameDay(d, new Date(activity.end_date))
            ),

          pink: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "pink" &&
                isInRange(
                  d,
                  new Date(activity.start_date),
                  new Date(activity.end_date)
                )
            ),
          pinkStart: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "pink" &&
                isSameDay(d, new Date(activity.start_date))
            ),
          pinkEnd: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "pink" &&
                isSameDay(d, new Date(activity.end_date))
            ),

          indigo: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "indigo" &&
                isInRange(
                  d,
                  new Date(activity.start_date),
                  new Date(activity.end_date)
                )
            ),
          indigoStart: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "indigo" &&
                isSameDay(d, new Date(activity.start_date))
            ),
          indigoEnd: (d) =>
            activities.some(
              (activity) =>
                colorByType(activity.type) === "indigo" &&
                isSameDay(d, new Date(activity.end_date))
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

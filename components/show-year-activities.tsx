"use client";
import { Activity } from "./sidebar-calendar";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

type Color =
  | "green"
  | "blue"
  | "red"
  | "gray"
  | "yellow"
  | "purple"
  | "pink"
  | "indigo";

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

const colorStyles: Record<Color, { dot: string; badge: string }> = {
  green: {
    dot: "bg-green-500",
    badge:
      "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300",
  },
  blue: {
    dot: "bg-blue-500",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  red: {
    dot: "bg-red-500",
    badge: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  },
  gray: {
    dot: "bg-gray-500",
    badge: "border-gray-500/30 bg-gray-500/10 text-gray-700 dark:text-gray-300",
  },
  yellow: {
    dot: "bg-yellow-500",
    badge:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  },
  purple: {
    dot: "bg-purple-500",
    badge:
      "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
  pink: {
    dot: "bg-pink-500",
    badge: "border-pink-500/30 bg-pink-500/10 text-pink-700 dark:text-pink-300",
  },
  indigo: {
    dot: "bg-indigo-500",
    badge:
      "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
};
export { colorStyles };
const termLabels = ["Pre-term", "Fall", "Spring", "Summer"];

function formatDateRange(start: string, end: string) {
  return `${new Date(start).toLocaleDateString()} - ${new Date(
    end
  ).toLocaleDateString()}`;
}

const YearActivities = ({ activities }: { activities?: Activity[] }) => {
  const safeActivities = activities ?? [];
  const typeLegend = Array.from(new Set(safeActivities.map((a) => a.type)));

  const [showActivities, setShowActivities] = useState<string[]>(typeLegend);

  // useEffect(() => {
  //   // Your effect logic here
  // }, [showActivities, setShowActivities]);

  const device = DeviceDetection();

  // const activitiesByTerms = termLabels.map((term) =>
  //   activities.filter((activity) => activity.term === term)
  // );

  return (
    <div className="grid gap-6 w-full">
      <Card className="">
        <CardHeader className="pb-3 pt-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {/* <CardTitle className="text-lg">Academic calendar</CardTitle> */}
              <CardDescription>Key dates and activity ranges</CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit">
              {safeActivities.length} activities
            </Badge>
          </div>
          {typeLegend.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {typeLegend.map((type) => {
                const isOn = showActivities.includes(type);
                const color = colorByType(type);
                const styles = colorStyles[color];
                return (
                  <span
                    key={type}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs cursor-pointer",
                      styles.badge
                    )}
                    onClick={() => {
                      if (isOn) {
                        setShowActivities((prev) =>
                          prev.filter((t) => t !== type)
                        );
                      } else {
                        setShowActivities((prev) => [...prev, type]);
                      }
                    }}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full ",
                        isOn ? styles.dot : "opacity-30"
                      )}
                      aria-hidden
                    />
                    {type}
                  </span>
                );
              })}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-2 pt-0 aspect-square md:aspect-auto">
          <Calendar
            className="w-full rounded-xl md:border bg-card p-2"
            numberOfMonths={
              device === "desktop" ? 5 : device === "tablet" ? 3 : 1
            }
            captionLayout="label"
            weekStartsOn={1}
            mode="single"
            selected={new Date()}
            showOutsideDays={false}
            onSelect={() => {}}
            modifiers={{
              green: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "green" &&
                    showActivities.includes(activity.type) &&
                    isInRange(
                      d,
                      new Date(activity.start_date),
                      new Date(activity.end_date)
                    )
                ),
              greenStart: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "green" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.start_date))
                ),
              greenEnd: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "green" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.end_date))
                ),

              blue: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "blue" &&
                    showActivities.includes(activity.type) &&
                    isInRange(
                      d,
                      new Date(activity.start_date),
                      new Date(activity.end_date)
                    )
                ),
              blueStart: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "blue" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.start_date))
                ),
              blueEnd: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "blue" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.end_date))
                ),

              red: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "red" &&
                    showActivities.includes(activity.type) &&
                    isInRange(
                      d,
                      new Date(activity.start_date),
                      new Date(activity.end_date)
                    )
                ),
              redStart: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "red" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.start_date))
                ),
              redEnd: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "red" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.end_date))
                ),

              yellow: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "yellow" &&
                    showActivities.includes(activity.type) &&
                    isInRange(
                      d,
                      new Date(activity.start_date),
                      new Date(activity.end_date)
                    )
                ),
              yellowStart: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "yellow" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.start_date))
                ),
              yellowEnd: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "yellow" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.end_date))
                ),

              purple: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "purple" &&
                    showActivities.includes(activity.type) &&
                    isInRange(
                      d,
                      new Date(activity.start_date),
                      new Date(activity.end_date)
                    )
                ),
              purpleStart: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "purple" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.start_date))
                ),
              purpleEnd: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "purple" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.end_date))
                ),

              pink: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "pink" &&
                    showActivities.includes(activity.type) &&
                    isInRange(
                      d,
                      new Date(activity.start_date),
                      new Date(activity.end_date)
                    )
                ),
              pinkStart: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "pink" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.start_date))
                ),
              pinkEnd: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "pink" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.end_date))
                ),

              indigo: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "indigo" &&
                    showActivities.includes(activity.type) &&
                    isInRange(
                      d,
                      new Date(activity.start_date),
                      new Date(activity.end_date)
                    )
                ),
              indigoStart: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "indigo" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.start_date))
                ),
              indigoEnd: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "indigo" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.end_date))
                ),

              gray: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "gray" &&
                    showActivities.includes(activity.type) &&
                    isInRange(
                      d,
                      new Date(activity.start_date),
                      new Date(activity.end_date)
                    )
                ),
              grayStart: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "gray" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.start_date))
                ),
              grayEnd: (d) =>
                safeActivities.some(
                  (activity) =>
                    colorByType(activity.type) === "gray" &&
                    showActivities.includes(activity.type) &&
                    isSameDay(d, new Date(activity.end_date))
                ),
            }}
            modifiersClassNames={{
              green:
                "bg-green-300/10 border-b-green-500 border-b-2 text-black dark:text-white ",
              blue: "bg-blue-300/10 border-b-blue-500 border-b-2 text-black dark:text-white",
              red: "bg-red-300/10 border-b-red-500 border-b-2 text-black dark:text-white",
              yellow:
                "bg-yellow-300/10 border-b-yellow-500 border-b-2 text-black dark:text-white ",
              purple:
                "bg-purple-300/10 border-b-purple-500 border-b-2 text-black dark:text-white",
              pink: "bg-pink-300/10 border-b-pink-500 border-b-2 text-black dark:text-white",
              indigo:
                "bg-indigo-300/10 border-b-indigo-500 border-b-2 text-black dark:text-white",
              //   gray: "bg-gray-500 text-white",

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
              grayStart: "rounded-l-md",
              grayEnd: "rounded-r-md",
            }}
          />
        </CardContent>
      </Card>

      {/* <div className="flex flex-wrap gap-2">
        {activitiesByTerms.map((termActivities, index) => {
          const label = termLabels[index];
          return (
            <Card key={label}>
              <CardHeader className="p-3 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{label}</CardTitle>
                  <Badge variant="secondary">
                    {termActivities.length} activities
                  </Badge>
                </div>
                <CardDescription>
                  {termActivities.length > 0
                    ? "Tap an activity for details"
                    : "No activities published for this term yet"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-2">
                {termActivities.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-6 text-sm text-muted-foreground">
                    No activities for this term.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {termActivities.map((activity) => {
                      const color = colorByType(activity.type);
                      const styles = colorStyles[color];
                      return (
                        <details
                          key={activity.id}
                          className="group rounded-lg border bg-card transition-colors hover:bg-accent/40"
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                            <div className="flex items-start gap-3">
                              <span
                                className={cn(
                                  "mt-1 h-3 w-3 shrink-0 rounded-full",
                                  styles.dot
                                )}
                                aria-hidden
                              />
                              <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium">
                                    {activity.name}
                                  </span>
                                  <Badge
                                    className={cn(
                                      "px-2 py-0.5 text-[0.65rem]",
                                      styles.badge
                                    )}
                                  >
                                    {activity.type}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDateRange(
                                    activity.start_date,
                                    activity.end_date
                                  )}
                                </div>
                              </div>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                          </summary>

                          <div className="border-t px-4 py-3 text-sm text-muted-foreground">
                            <div className="grid gap-2 sm:grid-cols-3">
                              <div>
                                <span className="text-foreground/80">
                                  Program:
                                </span>{" "}
                                {activity.program_level ?? "N/A"}
                              </div>
                              <div>
                                <span className="text-foreground/80">
                                  Course year:
                                </span>{" "}
                                {activity.course_year ?? "N/A"}
                              </div>
                              <div>
                                <span className="text-foreground/80">
                                  University:
                                </span>{" "}
                                {activity.university ?? "N/A"}
                              </div>
                            </div>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div> */}
    </div>
  );
};
export default YearActivities;

export function DeviceDetection():
  | "mobile"
  | "tablet"
  | "desktop"
  | "other"
  | null {
  if (typeof window === "undefined") return null;

  const width = window.innerWidth;

  if (width <= 768) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

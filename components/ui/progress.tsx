"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";
import { timeStringToPercent } from "@/lib/time-utils";
import { Clock, MapPin, User, BookOpen } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useEffect, useState } from "react";

// Convert time percentage to position on evenly distributed timeline (7-21 hours)
const convertToProportionalProgress = (linearPercent: number): number => {
  const hour = (linearPercent / 100) * 24;

  // Fixed range: 7-21 (15 hours total)
  const start = 6;
  const end = 20;
  const totalHours = end - start;

  // If before 7 AM, position at beginning
  if (hour < start) {
    return 0;
  }

  // If after 9 PM, position at end
  if (hour >= end) {
    return 100;
  }

  // Linear positioning within the 7-21 range
  const hoursFromStart = hour - start;
  return (hoursFromStart / totalHours) * 100;
};

interface Session {
  time: string;
  type: "lecture" | "practice";
  lecturer: string[];
  classroom: string;
  discipline: string;
}

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  sessions?: Session[];
  weekSessions?: Session[][];
}

function Progress({
  className,
  value,
  sessions,
  weekSessions,
  ...props
}: ProgressProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Set an interval to update the time every second
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000 * 60 * 60);

    // Clean up the interval when the component unmounts
    return () => clearInterval(timerId);
  }, []);
  const proportionalValue = convertToProportionalProgress(value || 0);
  // const proportionalValue2 = convertToProportionalProgress(
  //   timeStringToPercent(
  //     currentTime.toLocaleTimeString("ru-RU", {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     })
  //   ) || 0
  // );

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary relative h-4 overflow-hidden rounded-full w-full",
        // Hardcoded widths for different devices
        // "w-[320px]", // Mobile (default)
        // "sm:w-[640px]", // Small tablets
        // "md:w-[768px]", // Tablets
        // "lg:w-[1024px]", // Laptops
        // "xl:w-[1280px]", // Desktops
        // "2xl:w-[1536px]", // Large desktops
        weekSessions && "h-32 rounded-[8px]",
        className
      )}
      {...props}
    >
      {/* Current time dot indicator */}
      {/* <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "bg-blue-500/100 h-4 w-[3.47%] flex-1 transition-all hover:scale-150"
        )}
        style={{
          transform: `translateX(-${
            100 - proportionalValue
          }%) translateY(-100%)`,
        }}
      /> */}

      {sessions?.map((session, index) => {
        // Extract times
        const [startTimeStr, endTimeStr] = session.time.split("-");
        const startPercent = convertToProportionalProgress(
          timeStringToPercent(startTimeStr)
        );
        const endPercent = convertToProportionalProgress(
          timeStringToPercent(endTimeStr)
        );

        // Current time position (value is passed from parent Progress component)
        const currentPercent = proportionalValue; // value is already converted in the component body

        let status: "passed" | "current" | "upcoming" = "upcoming";

        if (currentPercent > endPercent) {
          status = "passed";
        } else if (
          currentPercent >= startPercent &&
          currentPercent <= endPercent
        ) {
          status = "current";
        }

        return (
          <HoverCard key={index} openDelay={50} closeDelay={50}>
            <HoverCardTrigger onClick={(e) => e.stopPropagation()} asChild>
              <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn(
                  "absolute my-0.5 h-3 w-20 transition-all duration-200 cursor-pointer rounded-sm",
                  "hover:scale-110 hover:shadow-lg hover:z-20",
                  "w-[5.8%]",

                  // Passed sessions: Gray and transparent
                  status === "passed" &&
                    "bg-slate-300 dark:bg-slate-700 opacity-40 grayscale hover:grayscale-0 hover:opacity-100",

                  // Current session: Pulsing ring and bright
                  status === "current" &&
                    "ring-2 ring-offset-1 ring-lime-500 z-10 animate-pulse",

                  // Upcoming (default) or Current: Type-based colors
                  status !== "passed" &&
                    (session.type === "lecture"
                      ? "bg-blue-500 hover:bg-blue-400"
                      : "bg-emerald-500 hover:bg-emerald-400")
                )}
                style={{
                  left: `calc(${startPercent}% - 0px)`,
                }}
              />
            </HoverCardTrigger>
            <HoverCardContent className="max-w-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white border-2 border-slate-600 shadow-2xl p-4">
              <div className="space-y-2.5">
                {/* Discipline - Main heading */}
                <div className="border-b border-slate-600 pb-2">
                  <h3 className="font-bold text-base leading-tight flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    {session.discipline}
                  </h3>
                </div>

                {/* Time and Type row */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-medium">{session.time}</span>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide",
                      session.type === "lecture"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                    )}
                  >
                    {session.type}
                  </span>
                </div>

                {/* Classroom */}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm">{session.classroom}</span>
                </div>

                {/* Lecturer */}
                <div className="flex items-start gap-1.5 pt-1 border-t border-slate-700/50">
                  <User className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-slate-300 leading-relaxed">
                    {session.lecturer.length > 2
                      ? `${session.lecturer.slice(0, 2).join(", ")} +${
                          session.lecturer.length - 2
                        } more`
                      : session.lecturer.join(", ")}
                  </span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      })}

      {weekSessions?.map((daySessions, index) => {
        return (
          <div key={index}>
            {daySessions.map((session, i) => {
              const startPercent = convertToProportionalProgress(
                timeStringToPercent(session.time.split("-")[0])
              );

              return (
                <div key={i}>
                  <ProgressPrimitive.Indicator
                    children={
                      <span className="text-xs px-2 line-clamp-1">{session.discipline}</span>
                    }
                    data-slot="progress-indicator"
                    className={cn(
                      "absolute my-0.5 h-4 w-20 transition-all duration-200 cursor-pointer rounded-xl",
                      "hover:scale-105 hover:shadow-lg hover:z-20 line-clamp-1",
                      "w-[5.8%] bg-blue-500"
                    )}
                    style={{
                      left: `calc( ${startPercent}% - 0px)`,
                      top: `calc(${(index * 100) / 6}% )`,
                    }}
                  />
                </div>
              );
            })}
            <ProgressPrimitive.Indicator
              children={
                <span className="text-xs px-2 line-clamp-1">
                  {
                    [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ][index]
                  }
                </span>
              }
              data-slot="progress-indicator"
              className={cn(
                "absolute my-0.5 h-4 w-20 sm:24 lg:w-32  transition-all duration-200 cursor-pointer rounded-xl",
                "hover:scale-105 hover:shadow-lg hover:z-20 line-clamp-1",
                "bg-blue-500"
              )}
              style={{
                left: `2px`,
                top: `calc(${(index * 100) / 6}% )`,
              }}
            />
          </div>
        );
      })}

      {/* Main indicator - invisible but creates the border */}
      {proportionalValue > 0 && proportionalValue < 100 && (
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="animate-pulse duration-1500 absolute top-0 h-full w-1 bg-red-500 shadow-red-500 transition-all z-20"
          style={{ left: `calc(${proportionalValue}% - 2px)` }}
          title={
            "Current time " +
            currentTime.toLocaleTimeString("ru-RU", {
              hour: "2-digit",
              minute: "2-digit",
            })
          }
        />
      )}
    </ProgressPrimitive.Root>
  );
}

export { Progress };

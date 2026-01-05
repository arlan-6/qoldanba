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
        "bg-primary relative h-3 overflow-hidden rounded-full w-full",
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

        let status: "passed" | "current" | "upcoming"  |"online"= "upcoming";

        if (currentPercent > endPercent) {
          status = "passed";
        } else if (
          currentPercent >= startPercent &&
          currentPercent <= endPercent
        ) {
          status = "current";
        }
        if(session.classroom==="Online"){
          status="online"
        }
        // status='upcoming'
        return (
          <HoverCard key={index} openDelay={50} closeDelay={50}>
  <HoverCardTrigger onClick={(e) => e.stopPropagation()} asChild>
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        // Base styling for the time slot indicator
        "absolute my-0.5 h-2 w-20 transition-all duration-200 cursor-pointer rounded-sm",
        "hover:scale-110 hover:shadow-lg hover:z-20",
        "w-[5.8%]", // Assuming width calculation is correct

        // Passed sessions: Muted, low-opacity look
        status === "passed" &&
          "bg-muted-foreground/80   hover:grayscale-0 hover:opacity-100", // Using muted-foreground for contrast

        // Current session: Pulsing ring using the theme's primary accent
        status === "current" &&
          "ring-2 ring-offset-1 ring-primary z-10 animate-pulse",

        // Session type-based coloring (used for upcoming/online/current)
        status !== "passed" &&
          (session.classroom === "online"
            ? "bg-secondary hover:bg-secondary/80" // Use secondary for online/remote
            : session.type === "lecture"
            ? "bg-primary hover:bg-primary/80" // Use primary for lectures (important)
            : "bg-primary/70 hover:bg-primary/50" // A slightly softer primary for other types
          )
      )}
      style={{
        left: `calc(${startPercent}% - 0px)`,
      }}
    />
  </HoverCardTrigger>
  {/* [Theme Change: HoverCard Content] Apply dark, glossy look using theme colors */}
  <HoverCardContent 
    className="max-w-sm p-4 text-white backdrop-blur-md border border-primary/40 shadow-md shadow-primary/20"
    // Using bg-card and text-foreground directly. If text-white is needed 
    // for high contrast against bg-card in dark mode, keep it, but 
    // using bg-card/70 for that glass look is better:
    style={{ backgroundColor: 'oklch(0.18 0.005 53.043 / 0.7)' }} 
  >
    <div className="space-y-2.5">
      {/* Discipline - Main heading */}
      <div className="border-b border-primary/40 pb-2"> {/* Used primary for separator */}
        <h3 className="font-bold text-base leading-tight flex items-center gap-2 text-primary"> {/* Used primary for icon and text */}
          <BookOpen className="w-4 h-4" />
          {session.discipline}
        </h3>
      </div>

      {/* Time and Type row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {/* Used muted for subtle icons */}
          <span className="text-sm font-medium text-foreground">{session.time}</span>
        </div>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide",
            // Type-specific colors using theme variables
            // session.type === "lecture"
               "bg-primary/20 text-primary border border-primary/40" // Primary for Lectures
              // : "bg-secondary/20 text-secondary border border-secondary/40" // Secondary for Labs/Seminars
          )}
        >
          {session.type}
        </span>
      </div>

      {/* Classroom */}
      <div className="flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm text-foreground">{session.classroom}</span>
      </div>

      {/* Lecturer */}
      <div className="flex items-start gap-1.5 pt-1 border-t border-muted/50"> {/* Used muted for subtle separator */}
        <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <span className="text-xs text-muted-foreground leading-relaxed"> {/* Used muted for secondary info text */}
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

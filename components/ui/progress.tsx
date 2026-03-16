"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";
import { getCurrentTimePercent, timeStringToPercent } from "@/lib/time-utils";
import { Clock, MapPin, User, BookOpen } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../animate-ui/primitives/animate/tooltip";
import { motion } from "motion/react";

// Convert time percentage to position on evenly distributed timeline (7-21 hours)
const convertToProportionalProgress = (linearPercent: number): number => {
  const hour = (linearPercent / 100) * 24;

  // Fixed range: 7-21 (15 hours total)
  const start = 8;
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

interface ProgressProps extends React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> {
  sessions?: Session[];
  weekSessions?: Session[][];
  isTomorrow?: boolean;
}

function SessionIndicatorCard({
  session,
  index,
  proportionalValue,
  isTomorrowCard = false,
}: {
  session: Session;
  index: number;
  proportionalValue: number;
  isTomorrowCard: boolean;
}) {
  const [startTimeStr, endTimeStr] = session.time.split("-");
  const startPercent = convertToProportionalProgress(
    timeStringToPercent(startTimeStr),
  );
  const endPercent = convertToProportionalProgress(
    timeStringToPercent(endTimeStr),
  );

  const isOnlineSession = session.classroom.toLowerCase() === "online";

  const currentPercent = proportionalValue;
  let status: "passed" | "current" | "upcoming" | "online" = "upcoming";

  if (currentPercent > endPercent) {
    status = "passed";
  } else if (currentPercent >= startPercent && currentPercent <= endPercent) {
    status = "current";
  }
  if (isOnlineSession) {
    status = "online";
  }
  if (isTomorrowCard) {
    status = "upcoming";
  }

  const statusBadgeClass =
    status === "current"
      ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/40"
      : status === "passed"
        ? "bg-muted/80 text-foreground border-border"
        : status === "online"
          ? "bg-sky-500/20 text-sky-100 border-sky-400/40"
          : "bg-amber-500/20 text-amber-100 border-amber-400/40";

  const typeBadgeClass =
    session.type === "practice"
      ? "bg-blue-500/20 text-blue-100 border-blue-400/40"
      : "bg-violet-500/20 text-violet-100 border-violet-400/40";

  const statusLabel =
    status === "current"
      ? "In progress"
      : status === "passed"
        ? "Done"
        : status === "online"
          ? "Online"
          : "Upcoming";

  const typeLabel = session.type === "practice" ? "Practice" : "Lecture";

  return (
    <HoverCard key={index} openDelay={50} closeDelay={50}>
      <HoverCardTrigger onClick={(e) => e.stopPropagation()} asChild>
        <motion.div
          className="absolute my-0.5 w-[6.9%] first:ml-0.5"
          style={{
            left: `calc(${startPercent}% - 0px)`,
          }}
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{
            duration: 0.25,
            delay: index * 0.03,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className={cn(
              "h-2 w-full cursor-pointer rounded-sm transition-all duration-200 hover:shadow-lg",
              status === "passed" &&
                "bg-muted-foreground/80 hover:grayscale-0 hover:opacity-100",
              status === "current" && "z-10 ring-2 ring-offset-1 animate-pulse",
              status !== "passed" &&
                (isOnlineSession
                  ? "bg-secondary hover:bg-secondary/80"
                  : session.type === "lecture"
                    ? "bg-primary hover:bg-primary/80"
                    : "bg-primary hover:bg-primary/50"),
            )}
          />
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent
        sideOffset={10}
        className="w-84 rounded-xl border border-border bg-card p-4 text-card-foreground shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
            <h3 className="font-semibold text-base leading-tight flex items-center gap-2 text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="line-clamp-2">{session.discipline}</span>
            </h3>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide whitespace-nowrap",
                statusBadgeClass,
              )}
            >
              {statusLabel}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-base font-semibold text-foreground">
                {session.time}
              </span>
            </div>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                typeBadgeClass,
              )}
            >
              {typeLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[1.05rem] font-medium text-foreground">
              {session.classroom}
            </span>
          </div>

          <div className="flex items-start gap-1.5 border-t border-border/70 pt-2">
            <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-sm text-muted-foreground leading-relaxed">
              {session.lecturer.length === 0
                ? "Unknown lecturer"
                : session.lecturer.length > 2
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
}

function WeekSessionsIndicators({
  weekSessions,
}: {
  weekSessions: Session[][];
}) {
  return (
    <>
      {weekSessions.map((daySessions, index) => {
        return (
          <div key={index}>
            {daySessions.map((session, i) => {
              const startPercent = convertToProportionalProgress(
                timeStringToPercent(session.time.split("-")[0]),
              );

              return (
                <div key={i}>
                  <ProgressPrimitive.Indicator
                    children={
                      <span className="text-xs px-2 line-clamp-1">
                        {session.discipline}
                      </span>
                    }
                    data-slot="progress-indicator"
                    className={cn(
                      "absolute my-0.5 h-4 w-20 transition-all duration-200 cursor-pointer rounded-xl",
                      "hover:scale-105 hover:shadow-lg hover:z-20 line-clamp-1",
                      "w-[5.8%] bg-blue-500",
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
                "bg-blue-500",
              )}
              style={{
                left: `2px`,
                top: `calc(${(index * 100) / 6}% )`,
              }}
            />
          </div>
        );
      })}
    </>
  );
}

function CurrentTimeIndicator({
  proportionalValue,
  currentTimeTitle,
  currentTimeString,
}: {
  proportionalValue: number;
  currentTimeTitle?: string;
  currentTimeString?: string;
}) {
  if (proportionalValue <= 0 || proportionalValue >= 100) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          className="absolute top-0 h-full z-30"
          animate={{ left: `calc(${proportionalValue}% - 2px)` }}
          transition={{
            type: "spring",
            stiffness: 140,
            damping: 20,
            mass: 0.5,
          }}
        >
          <ProgressPrimitive.Indicator
            data-slot="progress-indicator"
            className={cn(
              "absolute top-0 h-full w-0.75 rounded-full z-30 transition-all",
              "bg-linear-to-b from-red-400 via-red-500 to-red-600",
              "shadow-[0_0_10px_rgba(239,68,68,0.75)]",
              "animate-pulse",
              "hover:w-1.25 hover:shadow-[0_0_16px_rgba(239,68,68,0.95)]",
            )}
            style={{ left: `calc(${proportionalValue}% - 2px)` }}
            title={currentTimeTitle}
          >
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)]" />
          </ProgressPrimitive.Indicator>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent className="border p-2 bg-accent rounded">
        <p>
          {currentTimeString
            ? `Current time ${currentTimeString}`
            : "Current time"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function Progress({
  className,
  value,
  sessions,
  weekSessions,
  isTomorrow = false,
  ...props
}: ProgressProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [proportionalValue, setProportionalValue] = useState<number>(-1);

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(new Date());

    updateCurrentTime();
    const timerId = setInterval(updateCurrentTime, 1000 * 60);

    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (isTomorrow) {
      setProportionalValue(-1);
      return;
    }

    const updateProportionalValue = () => {
      const currentTimePercent = getCurrentTimePercent();
      const proportionalProgress =
        convertToProportionalProgress(currentTimePercent);
      setProportionalValue(proportionalProgress);
    };

    updateProportionalValue();
    const timerId = setInterval(updateProportionalValue, 1000 * 60);

    return () => clearInterval(timerId);
  }, [isTomorrow]);
  // const proportionalValue = convertToProportionalProgress(value || 0);
  // const proportionalValue2 = convertToProportionalProgress(
  //   timeStringToPercent(
  //     currentTime.toLocaleTimeString("ru-RU", {
  //       hour: "2-digit",
  //       minute: "2-digit",
  //     })
  //   ) || 0
  // );

  const currentTimeString = currentTime
    ? currentTime.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

  const currentTimeTitle = currentTimeString
    ? `Current time ${currentTimeString}`
    : undefined;

  return (
    <>
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
          weekSessions && "h-32 rounded-xl",
          className,
        )}
        {...props}
      >
        {sessions?.map((session, index) => (
          <SessionIndicatorCard
            key={index}
            session={session}
            index={index}
            proportionalValue={proportionalValue}
            isTomorrowCard={isTomorrow}
          />
        ))}

        {weekSessions && <WeekSessionsIndicators weekSessions={weekSessions} />}

        <CurrentTimeIndicator
          proportionalValue={proportionalValue}
          currentTimeTitle={currentTimeTitle}
          currentTimeString={currentTimeString}
        />
      </ProgressPrimitive.Root>
    </>
  );
}

export { Progress };

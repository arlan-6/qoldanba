"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Progress } from "./ui/progress";
import TimeSteps from "./time-steps";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs";
import { ScheduleSkeleton } from "./schedule-skeleton";

interface ScheduleProps {
  className?: string;
  group?: string;
  initialData?: WeekSchedule | null;
}

interface Session {
  time: string;
  type: "lecture" | "practice";
  lecturer: string[];
  classroom: string;
  discipline: string;
}

interface WeekSchedule {
  [day: string]: Session[];
}

import { getCurrentTimePercent, timeStringToPercent } from "@/lib/time-utils";
import { Badge } from "./ui/badge";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Tooltip, TooltipContent } from "./ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { WeekClasses } from "./week-classes";
import SessionsList from "./sessions-list";

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getDayName = (date: Date): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
};

const getWeekNumber = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfWeek = startOfYear.getDay();
  const firstMonday = new Date(
    startOfYear.getTime() +
      (dayOfWeek <= 4
        ? (4 - dayOfWeek) * 24 * 60 * 60 * 1000
        : (11 - dayOfWeek) * 24 * 60 * 60 * 1000)
  );
  const diffInDays = Math.floor(
    (date.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((diffInDays + 1) / 7);
};
export const Schedule: FC<ScheduleProps> = ({
  className,
  group,
  initialData,
}) => {
  const supabase = useMemo(() => createClient(), []);
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(
    initialData || null
  );
  const [isLoading, setIsLoading] = useState(!initialData && !!group);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we have initial data, we don't need to fetch
    if (initialData) {
      setWeekSchedule(initialData);
      setIsLoading(false);
      return;
    }

    if (!group) {
      setWeekSchedule(null);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    const fetchSchedule = async () => {
      try {
        const { data, error } = await supabase
          .from("schedules")
          .select("week_schedule")
          .eq("group_name", group.toUpperCase())
          .single();

        if (!active) return;

        if (error) {
          console.error("Error fetching schedule:", error);
          setError("Unable to load schedule");
          setWeekSchedule(null);
          return;
        }

        if (data?.week_schedule) {
          const sortedSchedule: WeekSchedule = {};
          DAYS_ORDER.forEach((day) => {
            if (data.week_schedule[day]) {
              sortedSchedule[day] = data.week_schedule[day];
            }
          });
          setWeekSchedule(sortedSchedule);
        } else {
          setWeekSchedule(null);
        }
      } catch (err) {
        if (!active) return;
        console.error("Unexpected error:", err);
        setError("Unable to load schedule");
        setWeekSchedule(null);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchSchedule();
    return () => {
      active = false;
    };
  }, [group, supabase, initialData]);

  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setToday(new Date());
  }, []);

  const tomorrow = useMemo(() => {
    if (!today) return null;
    const date = new Date(today);
    date.setDate(date.getDate() + 1);
    return date;
  }, [today]);

  const todayName = today ? getDayName(today) : "";
  const tomorrowName = tomorrow ? getDayName(tomorrow) : "";
  const weekNumber = today ? getWeekNumber(today) : "";

  const todaySessions = (weekSchedule?.[todayName] || []).filter(
    (sessions) => sessions.classroom !== "online"
  );
  const tomorrowSessions = weekSchedule?.[tomorrowName] || [];
  const allWeekSessions = weekSchedule
    ? DAYS_ORDER.map((day) => weekSchedule[day]).filter(
        (sessions): sessions is Session[] => sessions !== undefined
      )
    : [];

  const allWeekSessionsCount = allWeekSessions.reduce((total, day) => {
    return total + day.length;
  }, 0);

  const currentTimePercent = getCurrentTimePercent();
  const lastSessionEndTime = todaySessions.reduce((max, session) => {
    const endTime = session.time.split("-")[1];
    const endPercent = timeStringToPercent(endTime);
    return Math.max(max, endPercent);
  }, 0);

  if (isLoading || !mounted || !today || !tomorrow) {
    return <ScheduleSkeleton className={className} />;
  }

  if (error) {
    return <div className={cn("p-4 text-red-500", className)}>{error}</div>;
  }

  if (!group) {
    return (
      <div className={cn("p-4 text-muted-foreground", className)}>
        Select a group
      </div>
    );
  }

  return (
    <div className={cn("space-y-8 m-6 lg:m-10 ", className)}>
      <h1 className="text-xl font-bold">Schedule</h1>
      <Tabs defaultValue="today">
        <TabsList className="w-full flex items-center justify-between pr-2">
          <div className=" flex items-center justify-start">
            <TabsTrigger className="" value="today">
              Today <span className="lg:block hidden">- {todayName}</span>
            </TabsTrigger>
            <TabsTrigger className="" value="tomorrow">
              Tomorrow <span className="lg:block hidden">- {tomorrowName}</span>
            </TabsTrigger>
            <TabsTrigger className="" value="allWeek">
              All Week{" "}
            </TabsTrigger>
          </div>
          <Tooltip>
            <TooltipTrigger asChild className="cursor-help hidden md:block">
              <Badge variant={"outline"}>?</Badge>
            </TooltipTrigger>
            <TooltipContent
              side="left"
              className="bg-popover-foreground/70 border p-2 cursor-help text-popover"
            >
              <div>
                <span
                  className={cn(
                    "ml-auto px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider",
                    // session.type === "lecture"
                    "bg-secondary text-secondary-foreground"
                    // : "bg-emerald-500 text-white",
                  )}
                >
                  online
                </span>{" "}
                - Online class <br />
                <span
                  className={cn(
                    "ml-auto px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider",
                    // session.type === "lecture"
                    // "bg-blue-500 text-white",
                    "bg-primary text-primary-foreground"
                  )}
                >
                  University
                </span>{" "}
                - Ofline class <br />
                <span
                  className={cn(
                    "ml-auto px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider",
                    // session.type === "lecture"
                    // "bg-blue-500 text-white",
                    "bg-muted/80 text-muted-foreground"
                  )}
                >
                  Passed
                </span>{" "}
                - Past class <br />
                {/* <Badge variant={"outline"}>other</Badge> - Other */}
              </div>
            </TooltipContent>
          </Tooltip>
        </TabsList>
        <TabsContents>
          <TabsContent value="today" className="p-4">
            {/* Today */}
            <div>
              <h2 className="text-xl  mb-0">
                <span className="text-muted-foreground font-bold shadow-lg">
                  {todayName}
                </span>
              </h2>
              <div className="flex gap-16 mb-6 items-center">
                <p className="  ">
                  {todaySessions.length === 0 ? (
                    <span className="text-muted-foreground">No classes :D</span>
                  ) : (
                    <span className="text-muted-foreground">
                      {todaySessions.length} classes
                    </span>
                  )}
                </p>
              </div>

              {/* Time steps */}
              <TimeSteps daySchedule={todaySessions} />

              <Progress
                value={currentTimePercent}
                sessions={todaySessions}
                className="w-full bg-white "
              />

              {/* Classes List */}
              <SessionsList
                sessions={todaySessions}
                currentTimePercent={currentTimePercent}
                lastSessionEndTime={lastSessionEndTime}
              />
            </div>
          </TabsContent>
          <TabsContent value="tomorrow" className=" p-4">
            {/* Tomorrow */}
            <div className="">
              <h2 className="text-xl mb-0">
                <span className="text-muted-foreground font-bold shadow-lg">
                  {tomorrowName}
                </span>
              </h2>
              <p className="mb-6">
                {tomorrowSessions.length === 0 ? (
                  <span className="text-muted-foreground">No classes :D</span>
                ) : (
                  <span className="text-muted-foreground">
                    {tomorrowSessions.length} classes
                  </span>
                )}
              </p>

              {/* Time steps */}
              <TimeSteps daySchedule={tomorrowSessions} />

              <Progress
                value={0}
                sessions={tomorrowSessions}
                className="w-full bg-white "
              />
              <SessionsList
                sessions={tomorrowSessions}
                currentTimePercent={0}
                lastSessionEndTime={0}
                isTomorrow={true}
              />
            </div>
          </TabsContent>
          <TabsContent value="allWeek" className="p-4 ">
            <div className="">
              <h2 className="text-xl mb-0">
                <span className="text-muted-foreground font-bold shadow-lg">
                  Week #{weekNumber}
                </span>
              </h2>
              <p className="mb-6">
                {allWeekSessionsCount === 0 ? (
                  <span className="text-muted-foreground">No classes</span>
                ) : (
                  <span className="text-muted-foreground">
                    {allWeekSessionsCount} classes in week #{weekNumber}
                  </span>
                )}
              </p>
              <ScrollArea className="rounded-lg">
                <WeekClasses allWeekSessions={allWeekSessions} />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
};

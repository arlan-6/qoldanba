"use client";

import React, {
  FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Progress } from "./ui/progress";
import TimeSteps from "./time-steps";
import {
  Tabs,
  TabsContent,
  // TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import Link from "next/link";

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type ScheduleCache = {
  updatedAt: number;
  data: WeekSchedule;
};

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
        : (11 - dayOfWeek) * 24 * 60 * 60 * 1000),
  );
  const diffInDays = Math.floor(
    (date.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil((diffInDays + 1) / 7);
};
export const Schedule: FC<ScheduleProps> = ({
  className,
  group,
  initialData,
}) => {
  const supabase = useMemo(() => createClient(), []);
  const scheduleCacheKey = group
    ? `qoldanba:schedule:${group.toUpperCase()}`
    : null;
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(
    initialData || null,
  );
  const [isLoading, setIsLoading] = useState(!initialData && !!group);
  const [error, setError] = useState<string | null>(null);

  const loadCachedSchedule = React.useCallback(() => {
    if (!scheduleCacheKey) return null;
    try {
      const raw = localStorage.getItem(scheduleCacheKey);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as ScheduleCache | WeekSchedule;

      if (
        parsed &&
        typeof parsed === "object" &&
        "updatedAt" in parsed &&
        "data" in parsed
      ) {
        const cache = parsed as ScheduleCache;
        const isFresh = Date.now() - cache.updatedAt < ONE_DAY_MS;
        return {
          data: cache.data,
          isFresh,
        };
      }

      return {
        data: parsed as WeekSchedule,
        isFresh: false,
      };
    } catch {
      return null;
    }
  }, [scheduleCacheKey]);

  useLayoutEffect(() => {
    if (initialData) return;
    const cached = loadCachedSchedule();
    if (cached?.data) {
      setWeekSchedule(cached.data);
      setIsLoading(false);
    }
  }, [initialData, loadCachedSchedule]);

  useEffect(() => {
    if (!scheduleCacheKey || !initialData) return;
    try {
      localStorage.setItem(
        scheduleCacheKey,
        JSON.stringify({ updatedAt: Date.now(), data: initialData }),
      );
    } catch {}
  }, [initialData, scheduleCacheKey]);

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
    const cached = loadCachedSchedule();
    if (cached?.data) {
      setWeekSchedule(cached.data);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    setError(null);

    const fetchSchedule = async () => {
      try {
        if (cached?.data) {
          // Render cached schedule immediately, then refresh in background.
          setWeekSchedule(cached.data);
          setIsLoading(false);
        }

        const { data, error } = await supabase
          .from("schedules")
          .select("week_schedule")
          .eq("group_name", group.toUpperCase())
          .single();

        if (!active) return;

        if (error) {
          console.error("Error fetching schedule:", error);
          if (cached?.data) {
            setWeekSchedule(cached.data);
          } else {
            setError("Unable to load schedule");
            setWeekSchedule(null);
          }
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
          if (scheduleCacheKey) {
            try {
              localStorage.setItem(
                scheduleCacheKey,
                JSON.stringify({ updatedAt: Date.now(), data: sortedSchedule }),
              );
            } catch {}
          }
        } else {
          setWeekSchedule(null);
        }
      } catch (err) {
        if (!active) return;
        console.error("Unexpected error:", err);
        const cached = loadCachedSchedule();
        if (cached?.data) {
          setWeekSchedule(cached.data);
          setError(null);
        } else {
          setError("Unable to load schedule");
          setWeekSchedule(null);
        }
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
  }, [group, supabase, initialData, loadCachedSchedule]);

  const [today] = useState<Date>(() => new Date());

  const tomorrow = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 1);
    return date;
  }, [today]);

  const todayName = getDayName(today);
  const tomorrowName = getDayName(tomorrow);
  const weekNumber = getWeekNumber(today);

  const todaySessions = (weekSchedule?.[todayName] || []).filter(
    (sessions) => sessions.classroom !== "online",
  );
  const tomorrowSessions = weekSchedule?.[tomorrowName] || [];
  const allWeekSessions = weekSchedule
    ? DAYS_ORDER.map((day) => weekSchedule[day]).filter(
        (sessions): sessions is Session[] => sessions !== undefined,
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

  if (isLoading) {
    return <ScheduleSkeleton className={className} />;
  }

  if (error) {
    return (
      <div
        className={cn(
          "m-6 p-6 border-2 rounded-xl bg-accent/50 backdrop-blur",
          className,
        )}
      >
        <div className="space-y-3">
          <p className="font-semibold text-foreground">Group not found 404</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Link
            className={cn(
              "inline-block mt-4 px-4 py-2 rounded-lg",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "transition-colors font-medium text-sm",
            )}
            href="https://t.me/ArLaN_XD"
            target="_blank"
          >
            Contact me
          </Link>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className={cn("p-4 text-muted-foreground", className)}>
        Select a group
      </div>
    );
  }

  return (
    <div className={cn("space-y-8 m-6 mb-0  lg:m-10 lg:mb-0", className)}>
      <h1 className="text-xl mb-4 font-bold">Schedule</h1>
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
                    "bg-secondary text-secondary-foreground",
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
                    "bg-primary text-primary-foreground",
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
                    "bg-muted/80 text-muted-foreground",
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
        {/* <TabsContents> */}
        <TabsContent value="today" className="">
          {/* Today */}
          <div className="mb-4">
            {/* Time steps */}
            <div className="px-4 pt-4">
              <TimeSteps daySchedule={todaySessions} />

              <Progress
                value={currentTimePercent}
                sessions={todaySessions}
                className="w-full bg-white "
              />
            </div>

            {/* Classes List */}
            <SessionsList
              sessions={todaySessions}
              currentTimePercent={currentTimePercent}
              lastSessionEndTime={lastSessionEndTime}
            />
          </div>
        </TabsContent>
        <TabsContent value="tomorrow" className="">
          {/* Tomorrow */}
          <div className="mb-4">
            {/* Time steps */}
            <div className="px-4 pt-4">
              <TimeSteps daySchedule={tomorrowSessions} />

              <Progress
                value={0}
                sessions={tomorrowSessions}
                className="w-full bg-white "
                isTomorrow={true}
              />
            </div>
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
        {/* </TabsContents> */}
      </Tabs>
    </div>
  );
};

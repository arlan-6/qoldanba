"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Progress } from "./ui/progress";
import TimeSteps from "./time-steps";

interface ScheduleProps {
  className?: string;
  group?: string;
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

import { getCurrentTimePercent } from "@/lib/time-utils";

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
export const Schedule: FC<ScheduleProps> = ({ className, group }) => {
  const supabase = useMemo(() => createClient(), []);
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        setWeekSchedule(data?.week_schedule || null);
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
  }, [group, supabase]);

  const today = useMemo(() => new Date(), []);
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
  }, []);

  const todayName = getDayName(today);
  const tomorrowName = getDayName(tomorrow);

  const todaySessions = weekSchedule?.[todayName] || [];
  const tomorrowSessions = weekSchedule?.[tomorrowName] || [];

  if (isLoading) {
    return <div className={cn("p-4", className)}>Loading...</div>;
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
    <div className={cn("space-y-8 m-10 ", className)}>
      {/* Today */}
      <div>
        <h2 className="text-xl  mb-0">
          Today -{" "}
          <span className="text-muted-foreground font-bold shadow-lg">
            {todayName}
          </span>
        </h2>
        <p className="mb-4">
          {todaySessions.length === 0 ? (
            <span className="text-muted-foreground">No classes</span>
          ) : (
            <span className="text-muted-foreground">
              {todaySessions.length} classes
            </span>
          )}
        </p>

        {/* Time steps */}
        <TimeSteps daySchedule={todaySessions} />

        <Progress
          value={getCurrentTimePercent()}
          sessions={todaySessions}
          className="w-full bg-white "
        />
      </div>

      {/* Tomorrow */}
      <div>
        <h2 className="text-xl mb-0">
          Tomorrow -{" "}
          <span className="text-muted-foreground font-bold shadow-lg">
            {tomorrowName}
          </span>
        </h2>
        <p className="mb-4">
          {tomorrowSessions.length === 0 ? (
            <span className="text-muted-foreground">No classes</span>
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
      </div>
    </div>
  );
};

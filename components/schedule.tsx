"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Progress } from "./ui/progress";
import TimeSteps from "./time-steps";
import { Clock, MapPin, User } from "lucide-react";
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from '@/components/animate-ui/components/animate/tabs';
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
  }, [group, supabase, initialData]);

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
      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger className="lg:text-lg" value="today">
            Today <span className="lg:block hidden">- {todayName}</span> 
          </TabsTrigger>
          <TabsTrigger className="lg:text-lg" value="tomorrow">
            Tomorrow <span className="lg:block hidden">- {tomorrowName}</span>
          </TabsTrigger>
          <TabsTrigger className="lg:text-lg" value="allWeek">
            All Week
          </TabsTrigger>
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
                  <span className="text-muted-foreground">No classes</span>
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
            {todaySessions.length > 0 &&
              !(currentTimePercent > lastSessionEndTime) && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Today's Classes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todaySessions.map((session, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                      >
                        <div className="flex items-start gap-2 justify-between mb-4">
                          {/* Discipline - Main heading */}
                          <h4 className="font-bold text-lg leading-tight line-clamp-2">
                            {session.discipline}
                          </h4>
                        </div>

                        {/* Time and Type */}
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-base font-bold text-primary line-clamp-1">
                            {session.time}
                          </span>
                        </div>

                        {/* Classroom */}
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {session.classroom}
                          </span>
                        </div>

                        {/* Lecturer */}
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-muted-foreground leading-relaxed">
                            {session.lecturer.length > 2
                              ? `${session.lecturer.slice(0, 2).join(", ")} +${
                                  session.lecturer.length - 2
                                } more`
                              : session.lecturer.join(", ")}
                          </span>
                          <span
                            className={cn(
                              "ml-auto px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider",
                              session.type === "lecture"
                                ? "bg-blue-500 text-white"
                                : "bg-emerald-500 text-white"
                            )}
                          >
                            {session.type}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="">
                      <blockquote className="mt-6 border-l-2 pl-6 italic">
                        You passed all sessions
                      </blockquote>
                    </div>
                  </div>
                </div>
              )}
            {/* All passed message */}
            {todaySessions.length > 0 &&
              currentTimePercent > lastSessionEndTime && (
                <div className="m-6">
                  <blockquote className="border-l-2 border-emerald-500 pl-6 italic text-muted-foreground">
                    You passed all sessions
                  </blockquote>
                </div>
              )}
          </div>
        </TabsContent>
        <TabsContent
          value="tomorrow"
          className=" p-4"
        >
          {/* Tomorrow */}
          <div className="">
            <h2 className="text-xl mb-0">
              <span className="text-muted-foreground font-bold shadow-lg">
                {tomorrowName}
              </span>
            </h2>
            <p className="mb-6">
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
            {tomorrowSessions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">
                  Tomorrow's Classes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tomorrowSessions.map((session, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                    >
                      <div className="flex items-start gap-2 justify-between mb-4">
                        {/* Discipline - Main heading */}
                        <h4 className="font-bold text-lg leading-tight line-clamp-2">
                          {session.discipline}
                        </h4>
                      </div>

                      {/* Time and Type */}
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-base font-bold text-primary line-clamp-1">
                          {session.time}
                        </span>
                      </div>

                      {/* Classroom */}
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {session.classroom}
                        </span>
                      </div>

                      {/* Lecturer */}
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          {session.lecturer.length > 2
                            ? `${session.lecturer.slice(0, 2).join(", ")} +${
                                session.lecturer.length - 2
                              } more`
                            : session.lecturer.join(", ")}
                        </span>
                        <span
                          className={cn(
                            "ml-auto px-2 py-0.5 rounded-full text-xs font-semibold uppercase",
                            session.type === "lecture"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          )}
                        >
                          {session.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent
          value="allWeek"
          className="p-4"
        >All week</TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
};

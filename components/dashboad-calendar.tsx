"use client";
import React from "react";
import { Card, CardContent } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import type { DayProps } from "react-day-picker";

type DeadlineLike = {
  end_at?: string | null;
};

type DashboardCalendarDayProps = DayProps & {
  deadlineCountByDate: Record<string, number>;
};

const toUtcDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDeadlineCountBadgeClassName = (count: number) => {
  if (count >= 4) {
    return "bg-red-500 text-white shadow-red-950/30";
  }

  if (count >= 2) {
    return "bg-amber-400 text-amber-950 shadow-amber-950/20";
  }

  return "bg-blue-500 text-white shadow-blue-950/30";
};

const formatDeadlineCount = (count: number) => {
  if (count > 9) return "9+";
  return String(count);
};

function DashboardCalendarDay({
  day,
  className,
  children,
  deadlineCountByDate,
  "aria-label": ariaLabel,
  ...props
}: DashboardCalendarDayProps) {
  const count = deadlineCountByDate[day.isoDate];

  return (
    <td
      {...props}
      className={className}
      aria-label={
        count && ariaLabel
          ? `${ariaLabel}, ${count} deadline${count === 1 ? "" : "s"}`
          : ariaLabel
      }
    >
      {count ? (
        <span
          className={cn(
            "  pointer-events-none absolute -right-1.5 -top-1 z-50 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-background px-0.5 py-0.5 text-[6px] leading-none shadow-md bg-accent",
            getDeadlineCountBadgeClassName(count)
          )}
        >
          {formatDeadlineCount(count)}
        </span>
      ) : null}
      <div
        className={cn(
          "dashboard-calendar-day flex h-full min-h-[var(--cell-size)] w-full flex-col items-center justify-center rounded-md border border-transparent bg-muted/20 px-1 py-1 transition-colors"
        )}
      >
        <span className="leading-none">{children}</span>
      </div>
    </td>
  );
}

export default function DashboardCalendar({
  deadlines = [],
}: {
  deadlines?: DeadlineLike[];
}) {
  const deadlineCountByDate = React.useMemo(() => {
    return deadlines.reduce<Record<string, number>>((acc, deadline) => {
      if (!deadline?.end_at) return acc;

      const endDate = new Date(deadline.end_at);
      if (Number.isNaN(endDate.getTime())) return acc;

      const key = toUtcDateKey(endDate);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [deadlines]);

  const deadlineModifiers = React.useMemo(() => {
    const low: Date[] = [];
    const medium: Date[] = [];
    const high: Date[] = [];

    Object.entries(deadlineCountByDate).forEach(([key, count]) => {
      const [year, month, day] = key.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));

      if (count >= 4) {
        high.push(date);
        return;
      }

      if (count >= 2) {
        medium.push(date);
        return;
      }

      if (count >= 1) {
        low.push(date);
      }
    });

    return { low, medium, high };
  }, [deadlineCountByDate]);

  const calendarMonth = React.useMemo(() => {
    const earliestDeadline = deadlines.reduce<Date | null>(
      (earliest, deadline) => {
        if (!deadline?.end_at) return earliest;

        const endDate = new Date(deadline.end_at);
        if (Number.isNaN(endDate.getTime())) return earliest;

        if (!earliest || endDate < earliest) {
          return endDate;
        }

        return earliest;
      },
      null,
    );

    if (!earliestDeadline) return undefined;

    return new Date(
      Date.UTC(
        earliestDeadline.getUTCFullYear(),
        earliestDeadline.getUTCMonth(),
        1,
      ),
    );
  }, [deadlines]);

  return (
    <div className="px-6 mb-6">
      <Card>
        <CardContent className="p-0">
          <Calendar
            hideNavigation
            showOutsideDays={false}
            weekStartsOn={1}
            timeZone="UTC"
            month={calendarMonth}
            className="w-full bg-transparent"
            modifiers={{
              deadlineLow: deadlineModifiers.low,
              deadlineMedium: deadlineModifiers.medium,
              deadlineHigh: deadlineModifiers.high,
            }}
            modifiersClassNames={{
              deadlineLow:
                "[&>.dashboard-calendar-day]:border-sky-500/30 [&>.dashboard-calendar-day]:bg-sky-500/20 [&>.dashboard-calendar-day]:text-sky-950 dark:[&>.dashboard-calendar-day]:border-sky-400/30 dark:[&>.dashboard-calendar-day]:bg-sky-400/15 dark:[&>.dashboard-calendar-day]:text-sky-100",
              deadlineMedium:
                "[&>.dashboard-calendar-day]:border-amber-500/35 [&>.dashboard-calendar-day]:bg-amber-500/20 [&>.dashboard-calendar-day]:text-amber-950 dark:[&>.dashboard-calendar-day]:border-amber-400/30 dark:[&>.dashboard-calendar-day]:bg-amber-400/15 dark:[&>.dashboard-calendar-day]:text-amber-100",
              deadlineHigh:
                "[&>.dashboard-calendar-day]:border-rose-500/35 [&>.dashboard-calendar-day]:bg-rose-500/20 [&>.dashboard-calendar-day]:text-rose-950 dark:[&>.dashboard-calendar-day]:border-rose-400/30 dark:[&>.dashboard-calendar-day]:bg-rose-400/15 dark:[&>.dashboard-calendar-day]:text-rose-100",
            }}
            components={{
              Day: (props) => (
                <DashboardCalendarDay
                  {...props}
                  deadlineCountByDate={deadlineCountByDate}
                />
              ),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

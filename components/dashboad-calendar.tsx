"use client";
import React from "react";
import { Card, CardContent } from "./ui/card";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import type { DateRange, DayProps, OnSelectHandler } from "react-day-picker";
import { X } from "lucide-react";

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

const deadlineLegend = [
  {
    label: "1",
    className:
      "border-sky-500/30 bg-sky-500/20 dark:border-sky-400/30 dark:bg-sky-400/15",
  },
  {
    label: "2",
    className:
      "border-teal-500/30 bg-teal-500/20 dark:border-teal-400/30 dark:bg-teal-400/15",
  },
  {
    label: "3",
    className:
      "border-fuchsia-500/35 bg-fuchsia-500/20 dark:border-fuchsia-400/30 dark:bg-fuchsia-400/15",
  },
  {
    label: "4+",
    className:
      "border-rose-500/35 bg-rose-500/20 dark:border-rose-400/30 dark:bg-rose-400/15",
  },
] as const;

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
      <div
        className={cn(
          "  dashboard-calendar-day flex h-full min-h-[var(--cell-size)] w-full flex-col items-center justify-center rounded-md border border-transparent transition-colors",
          " ",
        )}
      >
        <span className="leading-none bg-black/0">{children}</span>
      </div>
    </td>
  );
}

export default function DashboardCalendar({
  deadlines = [],
  selectedRange,
  setSelectedRange,
}: {
  deadlines?: DeadlineLike[];
  selectedRange: DateRange | undefined;
  setSelectedRange: (dateRange: DateRange | undefined) => void;
}) {
  // const [selectedRange, setSelectedRange] = React.useState<
  //   DateRange | undefined
  // >();

  // if (!isMobile){
  //   return
  // }
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
    const one: Date[] = [];
    const two: Date[] = [];
    const three: Date[] = [];
    const fourPlus: Date[] = [];

    Object.entries(deadlineCountByDate).forEach(([key, count]) => {
      const [year, month, day] = key.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));

      if (count >= 4) {
        fourPlus.push(date);
        return;
      }

      if (count === 3) {
        three.push(date);
        return;
      }

      if (count === 2) {
        two.push(date);
        return;
      }

      if (count === 1) {
        one.push(date);
      }
    });

    return { one, two, three, fourPlus };
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

  const handleSelect: OnSelectHandler<DateRange | undefined> = (dateRange) => {
    setSelectedRange(dateRange);
  };

  return (
    <div className="aspect-3/4">
      <Card className="h-full">
        <CardContent className="p-0 h-full flex justify-between flex-col">
          <Calendar
            mode="range"
            onSelect={handleSelect}
            selected={selectedRange}
            showOutsideDays={false}
            weekStartsOn={1}
            timeZone="UTC"
            // month={calendarMonth}
            className="w-full bg-transparent"
            classNames={{
              selected: ` border-b-2  border-amber-500/50 text-white`, // Highlight the selected day
              root: `  shadow-lg`,
              chevron: `  fill-amber-500 `,
              today: `border-amber-500/60 bg-amber-500/30 border-2 rounded-md`,
            }}
            modifiers={{
              deadlineOne: deadlineModifiers.one,
              deadlineTwo: deadlineModifiers.two,
              deadlineThree: deadlineModifiers.three,
              deadlineFourPlus: deadlineModifiers.fourPlus,
            }}
            modifiersClassNames={{
              deadlineOne:
                "[&>.dashboard-calendar-day]:border-sky-500/30 [&>.dashboard-calendar-day]:bg-sky-500/20 [&>.dashboard-calendar-day]:text-sky-950 dark:[&>.dashboard-calendar-day]:border-sky-400/30 dark:[&>.dashboard-calendar-day]:bg-sky-400/15 dark:[&>.dashboard-calendar-day]:text-sky-100",
              deadlineTwo:
                "[&>.dashboard-calendar-day]:border-teal-500/30 [&>.dashboard-calendar-day]:bg-teal-500/20 [&>.dashboard-calendar-day]:text-teal-950 dark:[&>.dashboard-calendar-day]:border-teal-400/30 dark:[&>.dashboard-calendar-day]:bg-teal-400/15 dark:[&>.dashboard-calendar-day]:text-teal-100",
              deadlineThree:
                "[&>.dashboard-calendar-day]:border-amber-500/35 [&>.dashboard-calendar-day]:bg-amber-500/20 [&>.dashboard-calendar-day]:text-amber-950 dark:[&>.dashboard-calendar-day]:border-amber-400/30 dark:[&>.dashboard-calendar-day]:bg-amber-400/15 dark:[&>.dashboard-calendar-day]:text-amber-100",
              deadlineFourPlus:
                "[&>.dashboard-calendar-day]:border-rose-500/35 [&>.dashboard-calendar-day]:bg-rose-500/20 [&>.dashboard-calendar-day]:text-rose-950 dark:[&>.dashboard-calendar-day]:border-rose-400/30 dark:[&>.dashboard-calendar-day]:bg-rose-400/15 dark:[&>.dashboard-calendar-day]:text-rose-100",
            }}
            components={{
              Day: (props) => (
                <DashboardCalendarDay
                  {...props}
                  // className="hover:bg-red-500"
                  deadlineCountByDate={deadlineCountByDate}
                />
              ),
            }}
          />
          {selectedRange && (
            <div className="text-xs w-full flex items-center justify-center gap-4 bg-amber-500/50 px-4 py-1">
              {selectedRange.from
                ? `${String(selectedRange.from.getDate()).padStart(2, "0")}.${String(selectedRange.from.getMonth() + 1).padStart(2, "0")}.${selectedRange.from.getFullYear()}`
                : ""}{" "}
              -{" "}
              {selectedRange.to
                ? `${String(selectedRange.to.getDate()).padStart(2, "0")}.${String(selectedRange.to.getMonth() + 1).padStart(2, "0")}.${selectedRange.to.getFullYear()}`
                : ""}
              <span
                className="bg-accent p-1 rounded-2xl cursor-pointer "
                onClick={() => setSelectedRange(undefined)}
              >
                <X size={16} />
              </span>
            </div>
          )}
          <div className="relative bottom-0 flex items-center justify-end gap-2 border-t px-4 py-1 pb-3 text-sm text-muted-foreground">
            <span>Deadlines</span>
            <div className="flex items-center gap-1.5">
              {deadlineLegend.map((item) => (
                <div key={item.label} className="flex items-center gap-1  ">
                  <span
                    className={cn(
                      "h-3.5 w-3.5 rounded-[4px] border",
                      item.className,
                    )}
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

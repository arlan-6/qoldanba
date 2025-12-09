"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";
import { timeStringToPercent } from "@/lib/time-utils";
import { Clock, MapPin, User, BookOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Convert linear time percentage (0-100) to match TimeSteps proportional layout
// TimeSteps layout: [00-05] flex-1.2, [05-19] flex-5, [19-00] flex-1.2
const convertToProportionalProgress = (linearPercent: number): number => {
  const hour = (linearPercent / 100) * 24;

  // Section boundaries
  const section1End = 5; // 00-05 (6 hours)
  const section2End = 19; // 05-19 (14 hours)
  const section3End = 24; // 19-00 (5 hours)

  // Flex proportions
  const flex1 = 1.2;
  const flex2 = 5;
  const flex3 = 1.2;
  const totalFlex = flex1 + flex2 + flex3;

  if (hour <= section1End) {
    // In first section (00-05)
    const sectionProgress = hour / section1End;
    const sectionWidth = (flex1 / totalFlex) * 100;
    return sectionProgress * sectionWidth;
  } else if (hour <= section2End) {
    // In second section (05-19)
    const sectionProgress = (hour - section1End) / (section2End - section1End);
    const section1Width = (flex1 / totalFlex) * 100;
    const section2Width = (flex2 / totalFlex) * 100;
    return section1Width + sectionProgress * section2Width;
  } else {
    // In third section (19-00)
    const sectionProgress = (hour - section2End) / (section3End - section2End);
    const section1Width = (flex1 / totalFlex) * 100;
    const section2Width = (flex2 / totalFlex) * 100;
    const section3Width = (flex3 / totalFlex) * 100;
    return section1Width + section2Width + sectionProgress * section3Width;
  }
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
}

function Progress({ className, value, sessions, ...props }: ProgressProps) {
  const proportionalValue = convertToProportionalProgress(value || 0);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-4 overflow-hidden rounded-full",
        // Hardcoded widths for different devices
        "w-[320px]", // Mobile (default)
        "sm:w-[640px]", // Small tablets
        "md:w-[768px]", // Tablets
        "lg:w-[1024px]", // Laptops
        "xl:w-[1280px]", // Desktops
        "2xl:w-[1536px]", // Large desktops
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

      <TooltipProvider>
        {sessions?.map((session, index) => {
          // Extract start time from "08:00-08:50" format
          const startTime = session.time.split("-")[0]; // "08:00"
          const proportionalPercent = convertToProportionalProgress(
            timeStringToPercent(startTime)
          );

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <ProgressPrimitive.Indicator
                  data-slot="progress-indicator"
                  className={cn(
                    "absolute my-0.5 h-3 w-12 transition-all duration-200 cursor-pointer rounded-sm",
                    "hover:scale-110 hover:shadow-lg hover:z-10",
                    session.type === "lecture"
                      ? "bg-blue-500 hover:bg-blue-400"
                      : "bg-emerald-500 hover:bg-emerald-400"
                  )}
                  style={{
                    left: `calc(${proportionalPercent}% - 2px)`,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white border-2 border-slate-600 shadow-2xl p-4"
              >
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
                      <span className="text-sm font-medium">
                        {session.time}
                      </span>
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
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>

      {/* Main indicator - invisible but creates the border */}
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-red-500/0 h-full w-full flex-1 transition-all border-r-4 border-red-600 pointer-events-none"
        style={{ transform: `translateX(-${100 - proportionalValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

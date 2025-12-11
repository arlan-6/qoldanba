"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Session {
  time: string;
  type: "lecture" | "practice";
  lecturer: string[];
  classroom: string;
  discipline: string;
}

interface TimeStepsProps {
  daySchedule?: Session[];
}

const TimeSteps: React.FC<TimeStepsProps> = ({ daySchedule }) => {
  // All hours from 7 to 21
  const hours = [
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
  ];

  return (
    <div
      className={cn(
        "flex justify-between w-full",
        // Hardcoded widths for different devices (matching Progress component)
        // "w-[320px]", // Mobile (default)
        // "sm:w-[640px]", // Small tablets
        // "md:w-[768px]", // Tablets
        // "lg:w-[1024px]", // Laptops
        // "xl:w-[1280px]", // Desktops
        // "2xl:w-[1536px]" // Large desktops
      )}
    >
      {hours.map((hour, index) => {
        const hourNumber = parseInt(hour);
        const isOddHour = hourNumber % 2 !== 0 && hour !== "06" && hour !== "20";
        return(
        <div key={index} className="flex flex-col items-center">
          <span
            className={cn(isOddHour ? " hidden sm:hidden md:block lg:block xl:block 2xl:block bg-slate-300 dark:bg-slate-700 opacity-40 grayscale hover:grayscale-0 hover:opacity-100" : "",
              " relative after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:-translate-y-full after:text-center after:h-4 after:w-4  after:text  after:content-[var(--hour-value)]")}
            //    @ts-ignore
            style={{ "--hour-value": `'${hour}'` }}
          >
            |
          </span>
        </div>
      )})}
    </div>
  );
};

export default TimeSteps;

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
  daySchedule: Session[];
}

const TimeSteps: React.FC<TimeStepsProps> = ({ daySchedule }) => {
  // All hours from 7 to 21
  const hours = [
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
    "21",
  ];

  return (
    <div
      className={cn(
        "flex justify-between",
        // Hardcoded widths for different devices (matching Progress component)
        "w-[320px]", // Mobile (default)
        "sm:w-[640px]", // Small tablets
        "md:w-[768px]", // Tablets
        "lg:w-[1024px]", // Laptops
        "xl:w-[1280px]", // Desktops
        "2xl:w-[1536px]" // Large desktops
      )}
    >
      {hours.map((hour, index) => (
        <div key={index} className="flex flex-col items-center">
          <span
            className=" relative after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:-translate-y-full after:text-center after:h-4 after:w-4  after:text  after:content-[var(--hour-value)]"
            //    @ts-ignore
            style={{ "--hour-value": `'${hour}'` }}
          >
            |
          </span>
        </div>
      ))}
    </div>
  );
};

export default TimeSteps;

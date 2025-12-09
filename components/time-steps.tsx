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
  const hours = [
    ["00", "01", "02", "03", "04", "05"],
    [
    "05",
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
    ],
    ["19", "20", "21", "22", "23", "00"],
  ];
  return (
    <div
      className={cn(
        "flex ",
        // Hardcoded widths for different devices (matching Progress component)
        "w-[320px]", // Mobile (default)
        "sm:w-[640px]", // Small tablets
        "md:w-[768px]", // Tablets
        "lg:w-[1024px]", // Laptops
        "xl:w-[1280px]", // Desktops
        "2xl:w-[1536px]" // Large desktops
      )}
    >
      <div className="flex-[1.2] flex justify-between">
        {hours[0].map((hour, index) => (
          <div key={index} className="flex flex-col items-center">
            <span
              className={cn(`${hours[0].length === index + 1 ? "hidden" : ""}`," relative after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:-translate-y-3/4 after:text-center after:h-4 after:w-4  after:text-white after:text-sm  after:content-[var(--hour-value)]")}
              //    @ts-ignore
              style={{ "--hour-value": `'${hour}'` }}
            >
              |
            </span>
          </div>
        ))}
      </div>
      <div className="flex-[5] flex justify-between">
        {hours[1].map((hour, index) => (
          <div key={index} className="flex flex-col items-center">
            <span
              className=" relative after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:-translate-y-full after:text-center after:h-4 after:w-4  after:text-white  after:content-[var(--hour-value)]"
              //    @ts-ignore
              style={{ "--hour-value": `'${hour}'` }}
            >
              |
            </span>
          </div>
        ))}
      </div>
      <div className="flex-[1.2] flex justify-between">
        {hours[2].map((hour, index) => (
          <div key={index} className="flex flex-col items-center">
            <span
              className={cn(`${hours[2][0] === hour ? "hidden" : ""}`," relative after:absolute after:top-0 after:left-1/2 after:-translate-x-1/2 after:-translate-y-3/4 after:text-center after:h-4 after:w-4  after:text-white after:text-sm  after:content-[var(--hour-value)]")}
              //    @ts-ignore
              style={{ "--hour-value": `'${hour}'` }}
            >
              |
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeSteps;

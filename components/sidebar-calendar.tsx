"use client";

import * as React from "react";
import { useSidebar } from "./animate-ui/components/radix/sidebar";
import { Calendar } from "./ui/calendar";
import { motion } from "motion/react";

type Color =
  | "green"
  | "blue"
  | "red"
  | "gray"
  | "yellow"
  | "purple"
  | "pink"
  | "indigo";
type Activity = {
  academic_year: string;
  course_year: number;
  created_at: string;
  end_date: string;
  id: number;
  name: string;
  program_level: "Bachelor" | "Master" | "Phd";
  start_date: string;
  term: string;
  type: string;
  university: string;
};
export type { Activity };
function dayKey(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function isInRange(date: Date, from: Date, to: Date) {
  const x = dayKey(date);
  return x >= dayKey(from) && x <= dayKey(to);
}

function isSameDay(a: Date, b: Date) {
  return dayKey(a) === dayKey(b);
}

function colorByType(type: string): Color {
  switch (type) {
    case "study":
      return "gray";
    case "registration":
      return "blue";
    case "midterm":
      return "yellow";
    case "endterm":
      return "yellow";
    case "exam":
      return "red";
    case "final":
      return "purple";
    case "internship":
      return "indigo";
    case "defense":
      return "pink";
    case "break":
      return "blue";
    case "summer":
      return "green";
    default:
      return "blue";
  }
}

const SidebarCalendar = ({ activities }: { activities: Activity[] }) => {
  const { state, isMobile } = useSidebar();

  if (state !== "expanded" && !isMobile) return null;

  return (
    <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3,delay: 0.25 }}
    >
    <Calendar
      mode="single"
      selected={new Date()}
      onSelect={() => {}}
      weekStartsOn={1}
      captionLayout="dropdown"
      className="w-full border-0 p-0 bg-transparent text-sm"
      modifiers={{
        green: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "green" &&
              isInRange(
                d,
                new Date(activity.start_date),
                new Date(activity.end_date)
              )
          ),
        greenStart: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "green" &&
              isSameDay(d, new Date(activity.start_date))
          ),
        greenEnd: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "green" &&
              isSameDay(d, new Date(activity.end_date))
          ),

        blue: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "blue" &&
              isInRange(
                d,
                new Date(activity.start_date),
                new Date(activity.end_date)
              )
          ),
        blueStart: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "blue" &&
              isSameDay(d, new Date(activity.start_date))
          ),
        blueEnd: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "blue" &&
              isSameDay(d, new Date(activity.end_date))
          ),

        red: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "red" &&
              isInRange(
                d,
                new Date(activity.start_date),
                new Date(activity.end_date)
              )
          ),
        redStart: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "red" &&
              isSameDay(d, new Date(activity.start_date))
          ),
        redEnd: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "red" &&
              isSameDay(d, new Date(activity.end_date))
          ),

        yellow: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "yellow" &&
              isInRange(
                d,
                new Date(activity.start_date),
                new Date(activity.end_date)
              )
          ),
        yellowStart: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "yellow" &&
              isSameDay(d, new Date(activity.start_date))
          ),
        yellowEnd: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "yellow" &&
              isSameDay(d, new Date(activity.end_date))
          ),

        purple: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "purple" &&
              isInRange(
                d,
                new Date(activity.start_date),
                new Date(activity.end_date)
              )
          ),
        purpleStart: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "purple" &&
              isSameDay(d, new Date(activity.start_date))
          ),
        purpleEnd: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "purple" &&
              isSameDay(d, new Date(activity.end_date))
          ),

        pink: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "pink" &&
              isInRange(
                d,
                new Date(activity.start_date),
                new Date(activity.end_date)
              )
          ),
        pinkStart: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "pink" &&
              isSameDay(d, new Date(activity.start_date))
          ),
        pinkEnd: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "pink" &&
              isSameDay(d, new Date(activity.end_date))
          ),

        indigo: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "indigo" &&
              isInRange(
                d,
                new Date(activity.start_date),
                new Date(activity.end_date)
              )
          ),
        indigoStart: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "indigo" &&
              isSameDay(d, new Date(activity.start_date))
          ),
        indigoEnd: (d) =>
          activities.some(
            (activity) =>
              colorByType(activity.type) === "indigo" &&
              isSameDay(d, new Date(activity.end_date))
          ),
      }}
      modifiersClassNames={{
        // middle-of-range styling: NO rounding
        green: "bg-green-500 text-white",
        blue: "bg-blue-500 text-white",
        red: "bg-red-500 text-white",
        yellow: "bg-yellow-500 text-white",
        purple: "bg-purple-500 text-white",
        pink: "bg-pink-500 text-white",
        indigo: "bg-indigo-500 text-white",

        // range edges
        greenStart: "rounded-l-md",
        greenEnd: "rounded-r-md",
        blueStart: "rounded-l-md",
        blueEnd: "rounded-r-md",
        redStart: "rounded-l-md",
        redEnd: "rounded-r-md",
        yellowStart: "rounded-l-md",
        yellowEnd: "rounded-r-md",
        purpleStart: "rounded-l-md",
        purpleEnd: "rounded-r-md",
        pinkStart: "rounded-l-md",
        pinkEnd: "rounded-r-md",
        indigoStart: "rounded-l-md",
        indigoEnd: "rounded-r-md",
      }}
    /></motion.div>
  );
};

export default SidebarCalendar;

import React, { FC } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "./ui/badge";

interface Session {
  time: string;
  type: "lecture" | "practice";
  lecturer: string[];
  classroom: string;
  discipline: string;
}
interface WeekClassesProps {
  className?: string;
  allWeekSessions: Session[][];
}

export const WeekClasses: FC<WeekClassesProps> = ({
  className,
  allWeekSessions,
}) => {
  const timeSlots = [
    "08:00-08:50",
    "09:00-09:50",
    "10:00-10:50",
    "11:00-11:50",
    "12:00-12:50",
    "13:00-13:50\n13:05-13:55",
    "14:00-14:50",
    "15:00-15:50",
    "16:00-16:50",
    "17:00-17:50",
    "18:00-18:50",
    "19:00-19:50",
    "20:00-20:50",
  ];

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  console.log(allWeekSessions);

  return (
    <div className={cn("", className)}>
      <Table className="text-xs md:text-sm ">
        <TableHeader>
          <TableRow className="bg-accent">
            <TableHead>Time</TableHead>
            {weekdays.map((day, i) => (
              <TableHead
                className={cn(i === 0 && "sticky left-0 z-10")}
                key={i}
              >
                {day}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {timeSlots.map((slot, rowIdx) => (
            <TableRow key={rowIdx}>
              <TableCell className="font-medium bg-accent text-xs md:text-xs sticky left-0 z-10">
                {slot.split("\n")[0]}
              </TableCell>
              {allWeekSessions.map((sessionDay, dayIdx) => {
                const session = sessionDay.find((s) => slot.includes(s.time));
                return (
                  <TableCell
                    key={dayIdx}
                    className={dayIdx % 2 == 1 ? "bg-muted/50" : ""}
                  >
                    {session ? (
                      <div>
                        <div className="font-medium text-xs md:text-xs  ">
                          {session.discipline}
                        </div>
                        <div className="flex flex-col text-xs md:text-xs text-muted-foreground gap-1">
                          <div>
                            {session.lecturer[0]}
                            {session.lecturer.length > 1 && ", ..."}
                          </div>
                          <div>
                            {/* {session.classroom}{" "} */}
                            {session.classroom === "online" ? (
                              <Badge variant={"secondary"}>Online</Badge>
                            ) : (
                              <div className="flex gap-1 items-center">
                                {session.classroom}{" "}
                                <Badge
                                  variant={
                                    session.type === "practice"
                                      ? "default2"
                                      : "default"
                                  }
                                >
                                  {session.type}
                                </Badge>{" "}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

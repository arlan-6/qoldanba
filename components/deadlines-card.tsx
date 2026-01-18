"use client";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { dayCountUntillToday } from "@/lib/time-utils";
import { cn } from "@/lib/utils";
import { format, set } from "date-fns";
import { AlertOctagon, Calendar, Clock, Flag, User } from "lucide-react";
import { useEffect, useState } from "react";

interface DeadlinesCardProps {
  deadline: any;
  viewType: "card" | "list";
}

const DeadlinesCard = ({ deadline, viewType }: DeadlinesCardProps) => {
  if (!deadline) return null;
  const [, setTick] = useState(0);
  const endAt = deadline.end_at ? new Date(deadline.end_at) : null;
  const daysUntil = endAt ? dayCountUntillToday(endAt) : null;
  const dueSoon = endAt ? dayCountUntillToday(endAt, 7) : false;
  const dueNow = endAt ? dayCountUntillToday(endAt, 1) : false;

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((tick) => tick + 1);
    }, 1000 * 60);
    return () => clearInterval(timer);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        // delay: 0.5 * i,
        type: "spring",
        stiffness: 400,
        duration: 0.2,
      }}
      // whileHover={{ scale: 0.99 }}
      key={deadline.id}
      // className={cn(dayCountUntillToday(new Date(deadline.end_at), 1) && "shadow-2xl")}
    >
      <Card
        key={deadline.id}
        className={cn(
          "flex transition-all hover:bg-accent/50 group",
          viewType === "card" ? "flex-col" : "flex-row items-center rounded-sm",
          dueSoon && "border-blue-500/50",
          dueNow && "border-destructive/50"
        )}
      >
        <CardHeader
          className={cn(
            " p-2 px-4 pt-3",
            viewType === "list" ? "p-2 py-0 flex-1 " : ""
          )}
        >
          <div
            className={cn(
              "flex gap-2",
              viewType === "list"
                ? "items-center mb-0"
                : "justify-between items-start"
            )}
          >
            <div
              className={cn(
                "flex gap-2 w-full",
                viewType === "list" ? "items-center" : "flex-col items-start"
              )}
            >
              <CardTitle
                className={cn(
                  "leading-tight  flex items-start w-full justify-between",
                  viewType === "list" ? "text-sm ml-1" : "text-sm mt-0"
                )}
              >
                {deadline.subject}
                <Badge
                  variant={getBadgeVariant(deadline.event_type)}
                  className="shrink-0 ml-2 p-0.5 px-1 text-[0.65rem] rounded-sm"
                >
                  {deadline.event_type}
                </Badge>
              </CardTitle>
            </div>
            {/* {viewType === "card" && (
												<Checkbox checked={deadline.is_completed} disabled />
											)} */}
          </div>
          <CardDescription
            className={cn(
              "line-clamp-2 text-xs",
              viewType === "list" ? "mt-1" : ""
            )}
          >
            {deadline.title}
          </CardDescription>
        </CardHeader>
        <CardContent
          className={cn(
            "flex-1",
            viewType === "list" ? "p-2 flex-none w-50 md:w-75" : "pb-3"
          )}
        >
          <div
            className={cn(
              "flex text-sm text-muted-foreground",
              viewType === "list"
                ? "flex-col items-end gap-1"
                : "flex-col gap-1"
            )}
          >
            {deadline.lecturer && viewType === "card" && (
              <div className="flex items-center gap-2 text-xs">
                <User size={14} />
                <span>{deadline.lecturer}</span>
              </div>
            )}
            <div
              className={cn(
                "flex gap-4",
                viewType === "list" ? "items-center" : "justify-between w-full"
              )}
            >
              <div className="flex items-center gap-2 text-xs">
                <Calendar size={14} />
                <span>{endAt ? format(endAt, "PPP") : "TBD"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock size={14} />
                <span>{endAt ? format(endAt, "HH:mm") : "TBD"}</span>
              </div>
            </div>
            <div
              className={cn(
                "w-full pt-2",
                viewType === "card" ? "border-t-2" : ""
              )}
            >
              <div
                className={cn(
                  "text-lg flex items-center",
                  viewType === "list"
                    ? "justify-end"
                    : dueNow || dueSoon
                    ? "justify-between"
                    : "justify-end"
                )}
              >
                {dueNow ? (
                  <Badge className="flex items-center animate-pulse duration-1000 bg-destructive/50 hover:bg-destructive/20  border-destructive/50 text-destructive-foreground">
                    <AlertOctagon
                      size={viewType === "list" ? 12 : 16}
                      className="mr-2 my-0.5"
                    />{" "}
                    {"<"}1d
                  </Badge>
                ) : (
                  dueSoon && (
                    <Badge className="flex items-center  bg-blue-500/50 hover:bg-blue-500/20  border-blue-500/50 text-blue-500">
                      <Flag
                        size={viewType === "list" ? 12 : 16}
                        className="mr-2 my-0.5"
                      />{" "}
                      {"<"}
                      7d
                    </Badge>
                  )
                )}
                <span
                  className={cn(
                    viewType === "list" && "text-sm ml-4 ",
                    "text-accent-foreground"
                  )}
                >
                  {daysUntil ?? "TBD"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function getBadgeVariant(
  type: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (type?.toLowerCase()) {
    case "exam":
      return "default";
    case "assignment":
      return "default";
    case "quiz":
      return "default";
    default:
      return "default";
  }
}

export default DeadlinesCard;

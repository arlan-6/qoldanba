import { cn } from "@/lib/utils";
import { Clock, MapPin, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

interface Session {
  time: string;
  type: "lecture" | "practice";
  lecturer: string[];
  classroom: string;
  discipline: string;
}
interface SessionsListProps {
  sessions: Session[];
  currentTimePercent: number;
  lastSessionEndTime: number;
  isTomorrow?: boolean;
}

const SessionsList = ({
  sessions,
  currentTimePercent,
  lastSessionEndTime,
  isTomorrow,
}: SessionsListProps) => {
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map((part) => Number(part));
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const getRangeMinutes = (timeRange: string) => {
    const [start, end] = timeRange.split("-");
    if (!start || !end) return null;
    const startMinutes = toMinutes(start.trim());
    const endMinutes = toMinutes(end.trim());
    if (startMinutes === null || endMinutes === null) return null;
    return { startMinutes, endMinutes, start, end };
  };

  const lecturersMatch = (left: string[], right: string[]) => {
    if (left.length !== right.length) return false;
    return left.every((name, index) => name === right[index]);
  };

  const mergedSessions = safeSessions.reduce<Session[]>((acc, session) => {
    const last = acc[acc.length - 1];
    if (!last) return [...acc, session];

    const lastRange = getRangeMinutes(last.time);
    const nextRange = getRangeMinutes(session.time);
    const sameDetails =
      last.discipline === session.discipline &&
      last.type === session.type &&
      last.classroom === session.classroom &&
      lecturersMatch(last.lecturer, session.lecturer);

    if (lastRange && nextRange && sameDetails) {
      const gapMinutes = nextRange.startMinutes - lastRange.endMinutes;
      if (gapMinutes >= 0 && gapMinutes <= 10) {
        const merged: Session = {
          ...last,
          time: `${lastRange.start}-${nextRange.end}`,
        };
        return [...acc.slice(0, -1), merged];
      }
    }

    return [...acc, session];
  }, []);

  const visibleSessions = mergedSessions.filter(
    (session) => session.classroom !== "online",
  );

  // console.log(lastSessionEndTime , currentTimePercent)
  return (
    <div>
      {visibleSessions.length > 0 ? (
        <div className="mt-8">
          {/* <h3 className="text-base font-semibold mb-2">
            {isTomorrow ? "Tomorrow's Classes" : "Today's Classes"}
          </h3> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSessions.map((session, index) => {
              const lecturers = Array.isArray(session.lecturer)
                ? session.lecturer
                : [];

              const sessionKey = `${session.discipline}-${session.time}-${session.classroom}-${index}`;

              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.65,
                    delay: index * 0.03,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  key={sessionKey}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex justify-between flex-wrap">
                    <div className="flex items-start gap-2 justify-between mb-4">
                      {/* Discipline - Main heading */}
                      <h4 className="font-bold text-base leading-tight line-clamp-1">
                        {session.discipline}
                      </h4>
                    </div>

                    {/* Time and Type */}
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-base font-bold text-primary ">
                        {session.time}
                      </span>
                    </div>
                  </div>

                  {/* Classroom */}
                  <Link href={`/my/aitumap?room=${session.classroom}`}>
                    <div className="flex items-center gap-2 mb-2 underline underline-offset-2 underline-primary">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {session.classroom}
                      </span>
                    </div>
                  </Link>

                  {/* Lecturer */}
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      {lecturers.length > 2
                        ? `${lecturers.slice(0, 1).join(", ")}, +${
                            lecturers.length - 1
                          } more`
                        : lecturers.join(", ")}
                    </span>
                    <span
                      className={cn(
                        "ml-auto px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider",
                        session.type === "practice"
                          ? "bg-blue-500 text-white"
                          : "bg-emerald-500 text-white",
                      )}
                    >
                      {session.type}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            className="m-6"
          >
            <blockquote className="border-l-2 border-yellow-500 pl-6 italic text-muted-foreground">
              No classes scheduled for {isTomorrow ? "tomorrow" : "today"}.
              Enjoy your free time! ;D
            </blockquote>
          </motion.div>
        </>
      )}
      {/* All passed message */}
      {!isTomorrow &&
        visibleSessions.length > 0 &&
        currentTimePercent > lastSessionEndTime && (
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            className="m-6"
          >
            <blockquote className="border-l-2 border-emerald-500 pl-6 italic text-muted-foreground">
              You completed all sessions for today.
            </blockquote>
          </motion.div>
        )}
    </div>
  );
};

export default SessionsList;

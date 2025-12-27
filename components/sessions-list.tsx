import { cn } from "@/lib/utils";
import { Clock, MapPin, User } from "lucide-react";

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
  return (
    <div>
      {sessions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">
            {isTomorrow ? "Tomorrow's Classes" : "Today's Classes"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session, index) => {
              if (session.classroom === "online") return;

              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex items-start gap-2 justify-between mb-4">
                    {/* Discipline - Main heading */}
                    <h4 className="font-bold text-lg leading-tight line-clamp-2">
                      {session.discipline}
                    </h4>
                  </div>

                  {/* Time and Type */}
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-base font-bold text-primary line-clamp-1">
                      {session.time}
                    </span>
                  </div>

                  {/* Classroom */}
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {session.classroom}
                    </span>
                  </div>

                  {/* Lecturer */}
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      {session.lecturer.length > 2
                        ? `${session.lecturer.slice(0, 1).join(", ")}, +${
                            session.lecturer.length - 1
                          } more`
                        : session.lecturer.join(", ")}
                    </span>
                    <span
                      className={cn(
                        "ml-auto px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider",
                        session.classroom === "online"
                          ? "bg-blue-500 text-white"
                          : "bg-emerald-500 text-white"
                      )}
                    >
                      {session.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* All passed message */}
      {sessions.length > 0 && currentTimePercent > lastSessionEndTime && (
        <div className="m-6">
          <blockquote className="border-l-2 border-emerald-500 pl-6 italic text-muted-foreground">
            You passed all sessions
          </blockquote>
        </div>
      )}
    </div>
  );
};

export default SessionsList;

"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const LEARN_REMINDER_TOAST_ID = "learn-reminder-toast";

const getWeekNumber = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfWeek = startOfYear.getDay();
  const firstMonday = new Date(
    startOfYear.getTime() +
      (dayOfWeek <= 4
        ? (4 - dayOfWeek) * 24 * 60 * 60 * 1000
        : (11 - dayOfWeek) * 24 * 60 * 60 * 1000),
  );
  const diffInDays = Math.floor(
    (date.getTime() - firstMonday.getTime()) / (24 * 60 * 60 * 1000),
  );
  return Math.ceil((diffInDays + 1) / 7);
};

const ReminderToast = ({
  currentWeek,
  toastId,
}: {
  currentWeek: number;
  toastId: string | number;
}) => {
  const handleDone = () => {
    localStorage.setItem("last_learn_week", String(currentWeek));
    toast.dismiss(toastId);
  };

  const handleLater = () => {
    toast.dismiss(toastId);
  };

  return (
    <div className="w-[min(92vw,420px)] rounded-xl border border-border bg-background p-4 shadow-lg">
      <div className="space-y-1">
        <p className="text-sm font-semibold">Friendly reminder</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Quick weekly check for quizzes at
          <span className="font-medium text-foreground">
            {" "}
            learn.astanait.edu.kz
          </span>{" "}
          and you are all set.
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="sm" onClick={handleLater}>
          Maybe later
        </Button>
        <Button size="sm" onClick={handleDone}>
          Already did ^_^
        </Button>
      </div>
    </div>
  );
};

const LearmRemineder = () => {
  useEffect(() => {
    let lastShown = localStorage.getItem("last_learn_week");
    const currentWeek = getWeekNumber(new Date());

    if (!lastShown) {
      lastShown = String(currentWeek - 1);
    }

    if (Number(lastShown) !== currentWeek) {
      toast.custom(
        (id) => <ReminderToast currentWeek={currentWeek} toastId={id} />,
        {
          id: LEARN_REMINDER_TOAST_ID,
          dismissible: false,
          closeButton: false,
          duration: 1000 * 60 * 60 * 24 * 7,
          position: "bottom-right",
        },
      );
    }
  }, []);

  return null;
};

export default LearmRemineder;

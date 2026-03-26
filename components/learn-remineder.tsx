"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";

const LEARN_REMINDER_TOAST_ID = "learn-reminder-toast";

type LearnReminderRow = {
  user_id: string;
  last_learn_week: number;
};

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
  onDone,
}: {
  currentWeek: number;
  toastId: string | number;
  onDone: () => Promise<boolean>;
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleDone = async () => {
    if (isSaving) return;

    setIsSaving(true);
    const saved = await onDone();
    setIsSaving(false);

    if (saved) {
      toast.dismiss(toastId);
    }
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
        <Button size="sm" onClick={handleDone} disabled={isSaving}>
          {isSaving ? "Saving..." : "Already did ^_^"}
        </Button>
      </div>
    </div>
  );
};

const LearmRemineder = () => {
  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isMounted) return;

      const currentWeek = getWeekNumber(new Date());
      const legacyWeekRaw = localStorage.getItem("last_learn_week");
      const legacyWeek = Number(legacyWeekRaw);
      const hasValidLegacyWeek =
        Number.isInteger(legacyWeek) && legacyWeek >= 1 && legacyWeek <= 53;

      const { data: reminder, error: reminderError } = await supabase
        .from("learn_reminders")
        .select("last_learn_week")
        .eq("user_id", user.id)
        .maybeSingle<Pick<LearnReminderRow, "last_learn_week">>();

      if (reminderError) {
        console.error("Failed to load learn reminder:", reminderError.message);
        return;
      }

      let lastLearnWeek = reminder?.last_learn_week ?? null;

      if (lastLearnWeek === null && hasValidLegacyWeek) {
        const { error: migrateError } = await supabase
          .from("learn_reminders")
          .upsert(
            {
              user_id: user.id,
              last_learn_week: legacyWeek,
            },
            { onConflict: "user_id" },
          );

        if (!migrateError) {
          lastLearnWeek = legacyWeek;
          localStorage.removeItem("last_learn_week");
        }
      }

      if (!isMounted) return;

      if (lastLearnWeek !== currentWeek) {
        toast.custom(
          (id) => (
            <ReminderToast
              currentWeek={currentWeek}
              toastId={id}
              onDone={async () => {
                const { error: saveError } = await supabase
                  .from("learn_reminders")
                  .upsert(
                    {
                      user_id: user.id,
                      last_learn_week: currentWeek,
                    },
                    { onConflict: "user_id" },
                  );

                if (saveError) {
                  toast.error("Couldn't save progress. Please try again.");
                  return false;
                }

                localStorage.removeItem("last_learn_week");
                return true;
              }}
            />
          ),
          {
            id: LEARN_REMINDER_TOAST_ID,
            dismissible: false,
            closeButton: false,
            duration: 1000 * 60 * 60 * 24 * 7,
            position: "bottom-right",
          },
        );
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
};

export default LearmRemineder;

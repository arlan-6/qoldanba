import { createClient } from "@/lib/supabase/server";
import { Schedule } from "@/components/schedule";
import { getDeadlines, syncDeadlines } from "@/app/actions/deadlines";
import { redirect } from "next/navigation";
import Deadlines from "@/components/dedlines";
import { Metadata } from "next";
import { PushNotifications } from "@/components/push-notifications";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "View your schedule and deadlines.",
  robots: {
    index: false,
    follow: false,
  },
};

// export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // console.log("USER METADATA:", user);

  if (!user) {
    redirect("/auth/github");
  }

  // Parallel fetch: schedule + initial deadlines
  const schedulePromise = user.user_metadata?.group
    ? supabase
        .from("schedules")
        .select("week_schedule")
        .eq("group_name", user.user_metadata.group.toUpperCase())
        .single()
    : Promise.resolve({ data: null });

  const deadlinesPromise = getDeadlines();

  const [scheduleResult, initialDeadlines] = await Promise.all([
    schedulePromise,
    deadlinesPromise,
  ]);

  const scheduleData = scheduleResult.data?.week_schedule;
  let deadlines = initialDeadlines;

  const lastSync =
    deadlines.length > 0
      ? new Date(
          Math.max(
            ...deadlines.map((d: any) => new Date(d.updated_at).getTime())
          )
        )
      : null;

  const shouldSync = !lastSync || Date.now() - lastSync.getTime() > 3600 * 1000;

  if (user.user_metadata?.icsLink && shouldSync) {
    // Sync logic handled by server action
    const syncResult = await syncDeadlines(user.user_metadata.icsLink, false);
    if (!syncResult.error && syncResult.deadlines) {
      deadlines = syncResult.deadlines;
    } else {
      deadlines = await getDeadlines();
    }
  }

  // console.log(deadlines);
  return (
    <div className="">
      <div className="px-6 pt-4">
        <PushNotifications />
      </div>
      <Schedule group={user.user_metadata?.group} initialData={scheduleData} />
      {deadlines.length > 0 ? (
        <Deadlines deadlines={deadlines} />
      ) : (
        <p>No deadlines available.</p>
      )}
    </div>
  );
}

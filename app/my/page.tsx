import { createClient } from "@/lib/supabase/server";
import { Schedule } from "@/components/schedule";
import { redirect } from "next/navigation";

// export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch schedule data on server if user has a group
  let scheduleData = null;
  if (user.user_metadata?.group) {
    const { data } = await supabase
      .from("schedules")
      .select("week_schedule")
      .eq("group_name", user.user_metadata.group.toUpperCase())
      .single();

    scheduleData = data?.week_schedule;
  }

  return (
    <div className="">
      <Schedule group={user.user_metadata?.group} initialData={scheduleData} />
    </div>
  );
}

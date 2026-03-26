import { createClient } from "@/lib/supabase/server";
import { Schedule } from "@/components/schedule";
import { redirect } from "next/navigation";
import Deadlines from "@/components/dedlines";
import { Metadata } from "next";
import DashboardCalendar from "@/components/dashboad-calendar";
import { getDeadlines } from "@/app/actions/deadlines";
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

  const deadlines = await getDeadlines();

  // console.log(deadlines);
  return (
    <div className="">
      <Schedule group={user.user_metadata?.group} />
      {/* <DashboardCalendar deadlines={deadlines} /> */}
      <Deadlines
        deadlines={deadlines}
        icsUrl={user.user_metadata?.icsLink || ""}
      />
    </div>
  );
}

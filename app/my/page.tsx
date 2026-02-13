import { createClient } from "@/lib/supabase/server";
import { Schedule } from "@/components/schedule";
import { redirect } from "next/navigation";
import Deadlines from "@/components/dedlines";
import { Metadata } from "next";
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

  // console.log(deadlines);
  return (
    <div className="">
      <Schedule group={user.user_metadata?.group} />
      <Deadlines userId={user.id} icsUrl={user.user_metadata?.icsLink} />
    </div>
  );
}

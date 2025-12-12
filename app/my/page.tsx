import { createClient } from "@/lib/supabase/server";
import { Schedule } from "@/components/schedule";
import { getDeadlines, syncDeadlines } from "@/app/actions/deadlines";
import { redirect } from "next/navigation";
import Deadlines from "@/components/dedlines";

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

	let deadlines = await getDeadlines();

	const lastSync =
		deadlines.length > 0
			? new Date(
					Math.max(
						...deadlines.map((d: any) => new Date(d.updated_at).getTime()),
					),
			  )
			: null;

	const shouldSync = !lastSync || Date.now() - lastSync.getTime() > 3600 * 1000;

	if (user.user_metadata?.icsLink && shouldSync) {
		// Sync logic handled by server action
		await syncDeadlines(user.user_metadata.icsLink);
		deadlines = await getDeadlines();
	}

	// console.log(deadlines);
	return (
		<div className="">
			<Schedule group={user.user_metadata?.group} initialData={scheduleData} />
      {deadlines.length > 0 ? <Deadlines deadlines={deadlines} /> : <p>No deadlines available.</p>}
			
		</div>
	);
}

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { Schedule } from "@/components/schedule";

async function UserDetails() {
	const supabase = await createClient();
	const { data, error } = await supabase.auth.getUser()

	if (error || !data) {
		redirect("/auth/login");
	}

	// return JSON.stringify(data.claims, null, 2);
	return data.user;
}

export default async function DashboardPage() {
	const userData = await UserDetails();
	return (
		<div className="">
			<Suspense fallback={<div>Loading...</div>}>
				{/* {userData.email} */}

				<Schedule group={userData.user_metadata.group} />
			</Suspense>
		</div>
	);
}

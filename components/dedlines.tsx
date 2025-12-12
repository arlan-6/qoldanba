import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, User } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { dayCountUntillToday } from "@/lib/time-utils";

const Deadlines = ({ deadlines }: { deadlines: any[] }) => {
	if (!deadlines || deadlines.length === 0) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No deadlines found.
			</div>
		);
	}
	console.log(deadlines[11]);

	return (
		<div className="p-6">
			<div className="flex  flex-wrap items-center justify-between">
				<h1 className="text-2xl font-bold mb-6">
					Upcoming Deadlines ({deadlines.length})
				</h1>
				<div className="">
					<Tooltip>
						<TooltipTrigger asChild className="cursor-help">
							<Badge variant={"outline"}>?</Badge>
						</TooltipTrigger>
						<TooltipContent side="left" className="bg-black/70 border p-2 cursor-help">
							<p>
                                <Badge variant={"outline"}>exam</Badge> - Final, Midterm, Endterm&nbsp; &nbsp; <br />
                                <Badge variant={"outline"}>homework</Badge> - Assignment, Homework&nbsp; &nbsp; <br />
                                <Badge variant={"outline"}>quiz</Badge> - Quiz&nbsp; &nbsp; <br />
                                <Badge variant={"outline"}>deadline</Badge> - Others&nbsp; &nbsp; <br />
                                {/* <Badge variant={"outline"}>other</Badge> - Other */}
                            </p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{deadlines
					.sort(
						(a, b) =>
							new Date(a.end_at).getTime() - new Date(b.end_at).getTime(),
					)
					.map((deadline) => (
						<Card key={deadline.id} className="flex flex-col">
							<CardHeader className="pb-2">
								<div className="flex justify-between items-start gap-2">
									<Badge variant={getBadgeVariant(deadline.event_type)}>
										{deadline.event_type}
									</Badge>
									<Checkbox checked={deadline.is_completed} disabled />
								</div>
								<CardTitle className="text-lg mt-2 leading-tight">
									{deadline.title}
								</CardTitle>
								<CardDescription className="line-clamp-2">
									{deadline.subject}
								</CardDescription>
							</CardHeader>
							<CardContent className="flex-1 pb-3">
								<div className="flex flex-col gap-1 text-sm text-muted-foreground">
									{deadline.lecturer && (
										<div className="flex items-center gap-2">
											<User className="h-4 w-4" />
											<span>{deadline.lecturer}</span>
										</div>
									)}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											<span>{format(new Date(deadline.end_at), "PPP")}</span>
										</div>
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4" />
											<span>{format(new Date(deadline.end_at), "HH:mm")}</span>
										</div>
									</div>
									<div className="w-full border-t-2 pt-2">
										{/* <div className="w-full h-2 p-0.5 rounded-full bg-secondary">
											<div
												className="h-1 bg-blue-400 rounded-full transition-all duration-500"
												style={{
													width: `${dateCountUntillTodayToPercent(
														new Date(deadline.end_at),
													)}%`,
												}}
											/>
										</div> */}
										<div className="text-2xl ">
											{dayCountUntillToday(new Date(deadline.end_at))}
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
			</div>
		</div>
	);
};

function getBadgeVariant(
	type: string,
): "default" | "secondary" | "destructive" | "outline" {
	switch (type?.toLowerCase()) {
		case "exam":
			return "outline";
		case "assignment":
			return "outline";
		case "quiz":
			return "outline";
		default:
			return "outline";
	}
}

export default Deadlines;

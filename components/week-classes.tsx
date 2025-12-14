import React, { FC } from "react";
import { cn } from "@/lib/utils";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { time } from "console";

interface Session {
	time: string;
	type: "lecture" | "practice";
	lecturer: string[];
	classroom: string;
	discipline: string;
}
interface WeekClassesProps {
	className?: string;
	allWeekSessions: Session[][];
}

export const WeekClasses: FC<WeekClassesProps> = ({
	className,
	allWeekSessions,
}) => {
	const timeSlots = [
		// "06:00-07:00",
		// "07:00-08:00",
		"08:00-08:50",
		"09:00-09:50",
		"10:00-10:50",
		"11:00-11:50",
		"12:00-12:50",
		"13:00-13:50",
		"14:00-14:50",
		"15:00-15:50",
		"16:00-16:50",
		"17:00-17:50",
		"18:00-18:50",
		"19:00-19:50",
		"20:00-20:50",
	];
	console.log(allWeekSessions);

	return (
		<div className={cn("", className)}>
			<Table className="text-xs md:text-sm">
				<TableHeader>
					<TableRow className="bg-accent">
						<TableHead className="">Week day</TableHead>
						{timeSlots.map((slot, index) => (
							<TableHead key={index}>{slot}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{allWeekSessions.map((sessionDay, i) => (
						<TableRow key={i}>
							<TableCell className="font-medium bg-accent text-xs md:text-sm">
								{
									[
										"Monday",
										"Tuesday",
										"Wednesday",
										"Thursday",
										"Friday",
										"Saturday",
										"Sunday",
									][i]
								}
							</TableCell>
							{timeSlots.map((slot, j) => {
								const session = sessionDay.find((s) => s.time === slot);
								return (
									<TableCell key={j}>
										{session ? (
											<div className="">
												<div className="font-medium text-xs md:text-sm">
													{session.discipline}
												</div>
												<div className="flex flex-col text-xs md:text-sm text-muted-foreground gap-1">
													<div>
														{session.lecturer[0]}{" "}
														{session.lecturer.length > 1 && ", ..."}
													</div>
													<div>{session.classroom}</div>
												</div>
											</div>
										) : (
											"-"
										)}
									</TableCell>
								);
							})}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};

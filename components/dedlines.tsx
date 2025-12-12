"use client";
import React from "react";
import { format, set } from "date-fns";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { motion } from "motion/react";
import Link from "next/link";

const Deadlines = ({ deadlines }: { deadlines: any[] }) => {
	const [showExams, setShowExams] = React.useState(true);
	const [showAssignments, setShowAssignments] = React.useState(true);
	const [showQuizzes, setShowQuizzes] = React.useState(true);
	const [showDeadlines, setShowDeadlines] = React.useState(true);
	if (!deadlines || deadlines.length === 0) {
		return (
			<div className="p-6 text-center text-muted-foreground">
				No deadlines found.
			</div>
		);
	}

	const onFilterChange = (value: string[]) => {
		// console.log(value);
		setShowExams(value.includes("exam"));
		setShowAssignments(value.includes("assignment"));
		setShowQuizzes(value.includes("quiz"));
		setShowDeadlines(value.includes("deadline"));
	};

	const filteredDeadlines = deadlines.filter((deadline) => {
		if (deadline.event_type === "exam" && !showExams) return false;
		if (deadline.event_type === "homework" && !showAssignments) return false;
		if (deadline.event_type === "quiz" && !showQuizzes) return false;
		if (deadline.event_type === "deadline" && !showDeadlines) return false;
		return true;
	});

	return (
		<div className="p-6">
			<div className="flex  flex-wrap items-center justify-between mb-6">
				<div className="flex flex-wrap gap-2 md:gap-6 items-end">
					<h1 className="text-2xl font-bold ">
						Upcoming Deadlines ({filteredDeadlines.length})
					</h1>
					<Link className="text-sm line-clamp-1 underline" href={"https://lms.astanait.edu.kz/my/"}>LMS dashboard (click)</Link>
				</div>
				<div className="flex items-center gap-2 pt-4">
					<ToggleGroup
						defaultValue={["assignment", "quiz", "deadline", "exam"]}
						type="multiple"
						// variant={"outline"}
						spacing={25}
						onValueChange={onFilterChange}
					>
						<motion.div
							whileHover={{ y: -10 }}
							whileTap={{ scale: 0.9 }}
							transition={{
								// delay: 0.5 * i,
								type: "spring",
								stiffness: 200,
								duration: 0.1,
							}}
							initial={{ scale: 0.8 }}
							animate={{ y: 0, scale: 1 }}
						>
							<ToggleGroupItem
								variant={!showExams ? "default" : "outline"}
								className={cn(!showExams && "line-through", "text-md mx-1 md:m-2")}
								aria-label="exam"
								value="exam"
							>
								exam
							</ToggleGroupItem>
						</motion.div>
						<motion.div
							whileHover={{ y: -10 }}
							whileTap={{ scale: 0.9 }}
							transition={{
								// delay: 0.5 * i,
								type: "spring",
								stiffness: 200,
								duration: 0.1,
							}}
							initial={{ scale: 0.8 }}
							animate={{ y: 0, scale: 1 }}
						>
							<ToggleGroupItem
								variant={!showAssignments ? "default" : "outline"}
								className={cn(
									!showAssignments && "line-through",
									"text-md mx-1 md:m-2",
								)}
								aria-label="assignment"
								value="assignment"
							>
								assignment
							</ToggleGroupItem>
						</motion.div>
						<motion.div
							whileHover={{ y: -10 }}
							whileTap={{ scale: 0.9 }}
							transition={{
								// delay: 0.5 * i,
								type: "spring",
								stiffness: 200,
								duration: 0.1,
							}}
							initial={{ scale: 0.8 }}
							animate={{ y: 0, scale: 1 }}
						>
							<ToggleGroupItem
								variant={!showQuizzes ? "default" : "outline"}
								className={cn(!showQuizzes && "line-through", "text-md mx-1 md:m-2")}
								aria-label="quiz"
								value="quiz"
							>
								quiz
							</ToggleGroupItem>
						</motion.div>
						<motion.div
							whileHover={{ y: -10 }}
							whileTap={{ scale: 0.9 }}
							transition={{
								// delay: 0.5 * i,
								type: "spring",
								stiffness: 200,
								duration: 0.1,
							}}
							initial={{ scale: 0.8 }}
							animate={{ y: 0, scale: 1 }}
						>
							<ToggleGroupItem
								variant={!showDeadlines ? "default" : "outline"}
								className={cn(!showDeadlines && "line-through", "text-md mx-1 md:m-2")}
								aria-label="deadline"
								value="deadline"
							>
								deadline
							</ToggleGroupItem>
						</motion.div>
					</ToggleGroup>
					<Tooltip>
						<TooltipTrigger asChild className="cursor-help hidden md:block">
							<Badge variant={"outline"}>?</Badge>
						</TooltipTrigger>
						<TooltipContent
							side="left"
							className="bg-black/70 border p-2 cursor-help"
						>
							<div>
								<p>Filters</p>
								<Badge variant={"outline"}>exam</Badge> - Final, Midterm,
								Endterm&nbsp; &nbsp; <br />
								<Badge variant={"outline"}>homework</Badge> - Assignment,
								Homework&nbsp; &nbsp; <br />
								<Badge variant={"outline"}>quiz</Badge> - Quiz&nbsp; &nbsp;{" "}
								<br />
								<Badge variant={"outline"}>deadline</Badge> - Others&nbsp;
								&nbsp; <br />
								{/* <Badge variant={"outline"}>other</Badge> - Other */}
							</div>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<div
				className={cn(
					"grid gap-4 md:grid-cols-2 lg:grid-cols-4",
					filteredDeadlines.length < 0 && "md:grid-cols-1 lg:grid-cols-1",
				)}
			>
				{filteredDeadlines.length > 0 ? (
					filteredDeadlines
						.sort(
							(a, b) =>
								new Date(a.end_at).getTime() - new Date(b.end_at).getTime(),
						)
						.map((deadline, i) => (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{
									// delay: 0.5 * i,
									type: "spring",
									stiffness: 400,
									duration: 0.2,
								}}
								whileHover={{ scale: 0.95 }}
								key={deadline.id}
								className=""
							>
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
													<span>
														{format(new Date(deadline.end_at), "PPP")}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Clock className="h-4 w-4" />
													<span>
														{format(new Date(deadline.end_at), "HH:mm")}
													</span>
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
							</motion.div>
						))
				) : (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="w-full text-center"
						>
							No deadlines {":)"}
						</motion.div>
					</>
				)}
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

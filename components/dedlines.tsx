"use client";
import React from "react";
import { format, set } from "date-fns";
import {
	AlertOctagon,
	Calendar,
	Clock,
	Flag,
	User,
	LayoutGrid,
	List,
} from "lucide-react";
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
	const [viewType, setViewType] = React.useState<"list" | "card">("card");
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
					<Link
						className="text-sm line-clamp-1 underline"
						href={"https://lms.astanait.edu.kz/my/"}
					>
						LMS dashboard (click)
					</Link>
				</div>
				<div className="flex items-center gap-2 pt-4">
					<ToggleGroup
						defaultValue={["assignment", "quiz", "deadline", "exam"]}
						type="multiple"
						// variant={"outline"}
						spacing={25}
						onValueChange={onFilterChange}
					>
						<div className=" items-center bg-muted/50 p-1 rounded-lg mr-4 border hidden md:flex">
							<button
								onClick={() => setViewType("list")}
								className={cn(
									"p-1.5 rounded-md transition-all",
									viewType === "list"
										? "bg-background shadow-sm text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								<List size={18} />
							</button>
							<button
								onClick={() => setViewType("card")}
								className={cn(
									"p-1.5 rounded-md transition-all",
									viewType === "card"
										? "bg-background shadow-sm text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								<LayoutGrid size={18} />
							</button>
						</div>
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
								className={cn(
									!showExams && "line-through",
									"text-md mx-1 md:m-2",
								)}
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
								variant={!showDeadlines ? "default" : "outline"}
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
								variant={!showDeadlines ? "default" : "outline"}
								className={cn(
									!showQuizzes && "line-through",
									"text-md mx-1 md:m-2",
								)}
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
								className={cn(
									!showDeadlines && "line-through",
									"text-md mx-1 md:m-2",
								)}
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
								<Badge variant={"default"}>exam</Badge> - Final, Midterm,
								Endterm&nbsp; &nbsp; <br />
								<Badge variant={"default"}>homework</Badge> - Assignment,
								Homework&nbsp; &nbsp; <br />
								<Badge variant={"default"}>quiz</Badge> - Quiz&nbsp; &nbsp;{" "}
								<br />
								<Badge variant={"default"}>deadline</Badge> - Others&nbsp;
								&nbsp; <br />
								{/* <Badge variant={"outline"}>other</Badge> - Other */}
							</div>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<div
				className={cn(
					viewType === "card" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-4" : "",
					filteredDeadlines.length < 0 &&
						viewType === "card" &&
						"md:grid-cols-1 lg:grid-cols-1",
					viewType === "list" ? "flex flex-col gap-4" : "",
					filteredDeadlines.length < 0 &&
						viewType === "list" &&
						"flex flex-col gap-4",
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
								// whileHover={{ scale: 0.99 }}
								key={deadline.id}
								// className={cn(dayCountUntillToday(new Date(deadline.end_at), 1) && "shadow-2xl")}
							>
								<Card
									key={deadline.id}
									className={cn(
										"flex transition-all hover:bg-accent/50 group",
										viewType === "card" ? "flex-col" : "flex-row items-center",
										dayCountUntillToday(new Date(deadline.end_at), 7) &&
											"border-blue-500/50",
										dayCountUntillToday(new Date(deadline.end_at), 1) &&
											"border-destructive/50",
									)}
								>
									<CardHeader
										className={cn(
											"py-2 p-4",
											viewType === "list" ? "p-4 py-0 flex-1 " : "",
										)}
									>
										<div
											className={cn(
												"flex gap-2",
												viewType === "list"
													? "items-center mb-0"
													: "justify-between items-start",
											)}
										>
											<div
												className={cn(
													"flex gap-2 w-full",
													viewType === "list"
														? "items-center"
														: "flex-col items-start",
												)}
											>
												<CardTitle
													className={cn(
														"leading-tight  flex items-start w-full justify-between",
														viewType === "list"
															? "text-base mt-0"
															: "text-lg mt-0",
													)}
												>
													{deadline.subject}
													<Badge
														variant={getBadgeVariant(deadline.event_type)}
														className="shrink-0 ml-2"
													>
														{deadline.event_type}
													</Badge>
												</CardTitle>
											</div>
											{/* {viewType === "card" && (
												<Checkbox checked={deadline.is_completed} disabled />
											)} */}
										</div>
										<CardDescription
											className={cn(
												"line-clamp-2",
												viewType === "list" ? "mt-1" : "",
											)}
										>
											{deadline.title}
										</CardDescription>
									</CardHeader>
									<CardContent
										className={cn(
											"flex-1",
											viewType === "list"
												? "p-4 pt-4 flex-none w-[200px] md:w-[300px]"
												: "pb-3",
										)}
									>
										<div
											className={cn(
												"flex text-sm text-muted-foreground",
												viewType === "list"
													? "flex-col items-end gap-1"
													: "flex-col gap-1",
											)}
										>
											{deadline.lecturer && viewType === "card" && (
												<div className="flex items-center gap-2">
													<User className="h-4 w-4" />
													<span>{deadline.lecturer}</span>
												</div>
											)}
											<div
												className={cn(
													"flex gap-4",
													viewType === "list"
														? "items-center"
														: "justify-between w-full",
												)}
											>
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
											<div
												className={cn(
													"w-full pt-2",
													viewType === "card" ? "border-t-2" : "",
												)}
											>
												<div
													className={cn(
														"text-2xl flex items-center",
														viewType === "list"
															? "justify-end"
															: "justify-between",
													)}
												>
													<span
														className={cn(
															viewType === "list" && "text-lg mr-4",
														)}
													>
														{dayCountUntillToday(new Date(deadline.end_at))}
													</span>
													{dayCountUntillToday(new Date(deadline.end_at), 1) ? (
														<Badge className="flex items-center animate-pulse duration-1000 bg-destructive/50 hover:bg-destructive/20  border-destructive/50 text-destructive-foreground">
															<AlertOctagon size={16} className="mr-2 my-0.5" />{" "}
															{"<"}1d
														</Badge>
													) : (
														dayCountUntillToday(
															new Date(deadline.end_at),
															7,
														) && (
															<Badge className="flex items-center  bg-blue-500/50 hover:bg-blue-500/20  border-blue-500/50 text-blue-500">
																<Flag size={16} className="mr-2 my-0.5" /> {"<"}
																7d
															</Badge>
														)
													)}
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
			return "default";
		case "assignment":
			return "default";
		case "quiz":
			return "default";
		default:
			return "default";
	}
}

export default Deadlines;

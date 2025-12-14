import { ScheduleSkeleton } from "@/components/schedule-skeleton";
import { DeadlinesSkeleton } from "@/components/deadlines-skeleton";

export default function DashboardLoading() {
  return (
    <div className="">
      <ScheduleSkeleton />
      <DeadlinesSkeleton />
    </div>
  );
}

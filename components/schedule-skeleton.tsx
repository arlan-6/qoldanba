import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ScheduleSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-8 m-10", className)}>
      {/* Today Header */}
      <div>
        <div className="flex items-center gap-2 mb-0">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
        <div className="flex gap-16 mb-6 items-center mt-2">
          <Skeleton className="h-5 w-32" />
        </div>

        {/* Time Steps Skeleton */}
        <div className="grid grid-cols-[auto_1fr] gap-4 mb-4">
          {/* Not easy to replicate perfect grid here without complex structure, 
               so we'll just put a placeholder bar for the timeline area */}
          <Skeleton className="h-10 w-full col-span-2" />
        </div>

        {/* Progress Bar Skeleton */}
        <Skeleton className="h-4 w-full rounded-full" />

        {/* Classes List Skeleton */}
        <div className="mt-8">
          <Skeleton className="h-7 w-40 mb-4" /> {/* "Today's Classes" title */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 bg-card space-y-4">
                {/* Discipline */}
                <Skeleton className="h-6 w-3/4" />

                {/* Time */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>

                {/* Classroom */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>

                {/* Lecturer + Type */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

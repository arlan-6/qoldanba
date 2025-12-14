import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DeadlinesSkeleton() {
  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2 md:gap-6 items-end">
          <Skeleton className="h-8 w-64" /> {/* Title */}
          <Skeleton className="h-4 w-32" /> {/* Link */}
        </div>
        <div className="flex items-center gap-2 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-24" /> /* Filter buttons */
            ))}
          </div>
          <Skeleton className="h-10 w-10 rounded-full" /> {/* Help icon */}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <Skeleton className="h-5 w-16 rounded-full" /> {/* Badge */}
                <Skeleton className="h-4 w-4" /> {/* Checkbox */}
              </div>
              <Skeleton className="h-6 w-3/4 mt-2" /> {/* Title */}
              <Skeleton className="h-4 w-full mt-1" /> {/* Subject */}
              <Skeleton className="h-4 w-2/3 mt-1" /> {/* Subject line 2 */}
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-32" /> {/* Lecturer */}
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" /> {/* Date */}
                  <Skeleton className="h-4 w-16" /> {/* Time */}
                </div>
                <div className="w-full border-t pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" /> {/* Days left */}
                    <Skeleton className="h-6 w-20 rounded-full" />{" "}
                    {/* Status badge */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

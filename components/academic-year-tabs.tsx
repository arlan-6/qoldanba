"use client";

import * as React from "react";
import { Activity } from "@/components/sidebar-calendar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs";
import YearActivities from "@/components/show-year-activities";
import { Card } from "@/components/ui/card";

type AcademicYearTabsProps = {
  activities: Activity[];
};

export default function AcademicYearTabs({
  activities,
}: AcademicYearTabsProps) {
  const [activeYear, setActiveYear] = React.useState("firstYear");

  const visibleActivities = React.useMemo(() => {
    const courseYear =
      activeYear === "firstYear" ? 1 : activeYear === "secondYear" ? 2 : 3;

    return activities.filter((activity) => activity.course_year === courseYear);
  }, [activities, activeYear]);

  return (
    <Tabs
      value={activeYear}
      onValueChange={setActiveYear}
      className="space-y-4"
    >
      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto p-1">
        <TabsTrigger value="firstYear">1st year</TabsTrigger>
        <TabsTrigger value="secondYear">2nd year</TabsTrigger>
        <TabsTrigger value="thirdYear">3rd year</TabsTrigger>
      </TabsList>

      <div className="grid gap-6 max-w-full">
        <Card className="overflow-hidden">
          <YearActivities activities={visibleActivities} />
        </Card>
      </div>
    </Tabs>
  );
}

import { Activity } from "@/components/sidebar-calendar";
import { createClient } from "@/lib/supabase/server";
import AcademicYearTabs from "@/components/academic-year-tabs";

const AcademicYearPage = async () => {
  const supabase = await createClient();
  const academic_year =
    new Date().getMonth() < 7
      ? `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`
      : `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  const { data: activities } = await supabase
    .from("academic_calendar_activities")
    .select("*")
    .eq("academic_year", academic_year);

  const yearActivities = (activities as Activity[]) || [];

  return (
    <div className="mx-auto w-full max-w-350 p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Academic Year</h2>
        <p className="text-sm text-muted-foreground">
          Explore academic activities and key dates by course year.
        </p>
      </div>

      <AcademicYearTabs activities={yearActivities} />

      <div className="">
        <h3>{/* Public and national holidays, carrying the holidays */}</h3>
      </div>
    </div>
  );
};

export default AcademicYearPage;

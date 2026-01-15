import { Activity } from "@/components/sidebar-calendar";
import { createClient } from "@/lib/supabase/server";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/animate/tabs";
import YearActivities from "@/components/show-year-activities";

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

  const firstYearActivity = yearActivities.filter(
    (activity) => activity.course_year === 1
  );
  const secondYearActivity = yearActivities.filter(
    (activity) => activity.course_year === 2
  );
  const thirdYearActivity = yearActivities.filter(
    (activity) => activity.course_year === 3
  );
  // const fourthYearActivity = yearActivities.filter(activity => activity.course_year === 4);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold"> Academic Year</h2>
      <div className="">
        <Tabs>
          <TabsList>
            <TabsTrigger value="firstYear">1st year</TabsTrigger>
            <TabsTrigger value="secondYear">2nd year</TabsTrigger>
            <TabsTrigger value="thirdYear">3rd year</TabsTrigger>
            {/* <TabsTrigger value="fourthYear">4th year</TabsTrigger> */}
          </TabsList>
          <TabsContents>
            <TabsContent value="firstYear">
             <YearActivities activities={firstYearActivity} />
            </TabsContent>
            <TabsContent value="secondYear">
                <YearActivities activities={secondYearActivity} />
            </TabsContent>
            <TabsContent value="thirdYear">
              <YearActivities activities={thirdYearActivity} />
            </TabsContent>
            {/* <TabsContent value="fourthYear">
              Configure two-factor authentication settings here.
            </TabsContent> */}
          </TabsContents>
        </Tabs>
      </div>
      <div className="">
        <h3>
            {/* Public and national holidays, carrying the holidays */}
        </h3>
      </div>
    </div>
  );
};

export default AcademicYearPage;

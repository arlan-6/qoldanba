import Link from "next/link";

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4">
            <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
              LMS Calendar
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Connect your LMS calendar in minutes
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              Add your LMS calendar link once and let the site keep deadlines,
              exams, and class events in sync with your dashboard.
            </p>
          </div>

          <div className="mt-8 grid gap-6">
            <section className="rounded-xl border p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                What is the LMS calendar URL?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                It is a private web link (usually an iCalendar/ICS URL) that
                lets apps read your academic schedule. Add it once to view
                classes, assignments, and exams in one place.
              </p>
            </section>

            <section className="rounded-xl border  p-5">
              <h3 className="text-lg font-semibold text-slate-900">
                Why do I need it?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                I use the calendar to automatically pull due dates and class
                events so your deadlines stay current without manual updates.
              </p>
            </section>

            <section className="rounded-xl border  p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">
                How to get your LMS calendar
              </h3>
              <ol className="mt-3 space-y-3 text-sm text-slate-700">
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    1
                  </span>
                  <span>Open your LMS portal and log in to your account.</span>{" "}
                  <Link
                    className="underline text-blue-500"
                    href={"https://lms.astanait.edu.kz/my/"}
                  >
                    Lms (click)
                  </Link>
                </li>
                <div className="">
                  <img
                    src="/lms-calendar/step1.png"
                    alt="LMS Calendar Instructions"
                    width={280}
                  />
                </div>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    2
                  </span>
                  <span>
                    After login, click your profile name in the top-right.
                  </span>
                </li>
                <div className="">
                  <img
                    src="/lms-calendar/step2.png"
                    alt="LMS Calendar Instructions"
                    width={280}
                  />
                </div>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    3
                  </span>
                  <span>From the dropdown, select “Calendar.”</span>
                </li>
                <div className="">
                  <img
                    src="/lms-calendar/step3.png"
                    alt="LMS Calendar Instructions"
                    width={280}
                  />
                </div>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    4
                  </span>
                  <span>
                    On the calendar page, click “Import or export calendars.”
                  </span>
                </li>
                <div className="">
                  <img
                    src="/lms-calendar/step4.png"
                    alt="LMS Calendar Instructions"
                    width={900}
                  />
                </div>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    5
                  </span>
                  <span>Click “Export calendar.”</span>
                </li>
                <div className="">
                  <img
                    src="/lms-calendar/step5.png"
                    alt="LMS Calendar Instructions"
                    width={900}
                  />
                </div>
                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    6
                  </span>
                  <span>
                    Choose “All events,” set the time period (e.g., “Custom
                    range”), then click “Get calendar URL.”
                  </span>
                </li>
                <div className="">
                  <img
                    src="/lms-calendar/step6.png"
                    alt="LMS Calendar Instructions"
                    width={900}
                  />
                </div>

                <li className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    7
                  </span>
                  <span>Copy the URL using the “Copy URL” button.</span>
                </li>
                <div className="">
                  <img
                    src="/lms-calendar/step7.png"
                    alt="LMS Calendar Instructions"
                    width={900}
                  />
                </div>
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Page;

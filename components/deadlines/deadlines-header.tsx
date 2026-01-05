import React from "react";
import Link from "next/link";

interface DeadlinesHeaderProps {
  count: number;
}

const DeadlinesHeader = ({ count }: DeadlinesHeaderProps) => {
  return (
    <div className="flex flex-wrap gap-2 md:gap-6 items-end">
      <h1 className="text-xl font-bold ">Upcoming Deadlines ({count})</h1>
      <Link
        className="text-sm line-clamp-1 underline"
        href={"https://lms.astanait.edu.kz/my/"}
      >
        LMS dashboard (click)
      </Link>
    </div>
  );
};

export default DeadlinesHeader;

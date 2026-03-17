import React from "react";
import Link from "next/link";

interface DeadlinesHeaderProps {
  count: number;
}

const DeadlinesHeader = ({ count }: DeadlinesHeaderProps) => {
  return (
    <div className="flex flex-wrap gap-2 md:gap-6 items-end">
      <div className="text-xl font-bold ">Upcoming Deadlines ({count})</div>
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

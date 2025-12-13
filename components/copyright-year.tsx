// components/copyright-year.tsx
"use client";

import { useEffect, useState } from "react";

export function CopyrightYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Return a placeholder during SSR and initial render
  return <>{year || "2024"}</>;
}
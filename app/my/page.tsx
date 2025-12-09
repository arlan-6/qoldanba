"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Schedule } from "@/components/schedule";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        router.push("/auth/login");
        return;
      }

      setUser(data.user);
      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="">
      <Schedule group={user.user_metadata?.group} />
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import Link from "next/link";

export function OnboardingForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [group, setGroup] = useState("");
  const [icsLink, setIcsLink] = useState("");
  const [degreeProgram, setDegreeProgram] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();



  
  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          group: group,
          icsLink: icsLink,
          degreeProgram: degreeProgram,
        },
      });
      if (error) throw error;
      router.push("/my");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Profile</CardTitle>
          <CardDescription>
            Please provide the following information to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOnboarding}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="group">Group</Label>
                <Input
                  id="group"
                  type="text"
                  required
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="BDA-2506"
                  pattern="[A-Z]{2,5}-\d{4}"
                  title="Group should be in format BDA-2506"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="degree-program">Degree Program</Label>
                <select
                  id="degree-program"
                  required
                  value={degreeProgram}
                  onChange={(e) => setDegreeProgram(e.target.value)}
                  className="flex h-10 rounded-md border border-input bg-accent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a degree program</option>
                  <option value="Bachelor">
                    Bachelor degree
                  </option>
                  <option value="Master">
                    Master degree
                  </option>
                  <option value="Phd">
                    Phd degree
                  </option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ics-link">
                  ICS Link
                  <Tooltip>
                    <TooltipTrigger
                      onClick={() => {
                        toast("Export calendar from LMS", {
                          action: {
                            label: "LMS link",
                            onClick: () => {
                              window.open(
                                "https://lms.astanait.edu.kz/calendar/export.php?",
                                "_blank"
                              );
                            },
                          },
                          duration: 10000,
                          description:
                            'Choose "all events", "click custom range"',
                        });
                      }}
                      className="ml-2 text-muted-foreground hover:text-foreground"
                    >
                      {" "}
                      <Badge variant={"outline"}>?</Badge>
                    </TooltipTrigger>
                    <TooltipContent className="border p-2 px-3 bg-background text-sm">
                      <p>ICS Link should be from LMS calendar</p>
                      <li className="list-disc">
                        <ul>1. Open link below</ul>
                        <ul>2. Click all events</ul>
                        <ul>3. Click Custom range</ul>
                        <ul>4. Click Get calendar URL</ul>
                      </li>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="ics-link"
                  type="text"
                  required
                  value={icsLink}
                  onChange={(e) => setIcsLink(e.target.value)}
                  placeholder="https://lms.astanait.edu.kz/calendar/export_execute.php?"
                />
                <div className="text-xs text-muted-foreground">
                  <p>ICS Link should be from LMS calendar</p>
                  <Link
                    className="underline"
                    target="_blank"
                    href="https://lms.astanait.edu.kz/calendar/export.php?"
                  >
                    https://lms.astanait.edu.kz/calendar/export.php?
                  </Link>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save & Continue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

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
  const GROUP_REGEX = /^[A-Z]{2,5}-[0-9]{4}$/;
  const GROUP_INPUT_REGEX = /^[A-Z0-9-]*$/;

  const [group, setGroup] = useState("");
  const [icsLink, setIcsLink] = useState("");
  const [degreeProgram, setDegreeProgram] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGroupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value.toUpperCase();

    if (
      (GROUP_INPUT_REGEX.test(nextValue) || nextValue === "") &&
      nextValue.length <= 10
    ) {
      setGroup(nextValue);
    }
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (!GROUP_REGEX.test(group)) {
      setError("Group must be in format BDA-2506");
      setIsLoading(false);
      return;
    }

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
                  onChange={handleGroupChange}
                  placeholder="BDA-2506"
                  pattern="[A-Z]{2,5}-[0-9]{4}"
                  title="Use format BDA-2506"
                  maxLength={10}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-describedby="group-help"
                />
                <p id="group-help" className="text-xs text-muted-foreground">
                  Format: 2 to 5 uppercase letters, dash, 4 digits (example:
                  BDA-2506)
                </p>
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
                  <option value="Bachelor">Bachelor degree</option>
                  <option value="Master">Master degree</option>
                  <option value="Phd">Phd degree</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ics-link">ICS Link</Label>
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
                    href="/lms-calendar"
                  >
                    Instruction how to get ICS link
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

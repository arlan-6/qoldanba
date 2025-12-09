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

export function OnboardingForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [group, setGroup] = useState("");
    const [icsLink, setIcsLink] = useState("");
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
                },
            });
            if (error) throw error;
            router.push("/protected");
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
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="ics-link">ICS Link</Label>
                                <Input
                                    id="ics-link"
                                    type="text"
                                    required
                                    value={icsLink}
                                    onChange={(e) => setIcsLink(e.target.value)}
                                />
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

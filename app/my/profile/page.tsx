"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { motion } from "motion/react";
import {
  User as UserIcon,
  Mail,
  Users,
  Link as LinkIcon,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
      console.log(user);
    };
    fetchUser();
  }, [supabase]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("ICS link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">Not Authenticated</h2>
        <p className="text-muted-foreground">
          Please sign in to view your profile.
        </p>
        <Button asChild>
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  const metadata = user.user_metadata || {};
  const fullName = metadata.full_name || metadata.name || metadata.user_name || "User";
  const group = metadata.group || "Not assigned";
  const icsLink = metadata.icsLink || "";
  const avatarUrl = metadata.avatar_url;

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-8 items-start">
          {/* Avatar Section */}
          <Card className="w-full overflow-hidden border-none bg-gradient-to-b from-primary/10 to-transparent ">
            <CardContent className="pt-8 flex flex-row items-center text-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background bg-muted flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className=" px-4">
                <h2 className="mt-6 text-2xl font-bold truncate w-full">
                  {fullName}
                </h2>
                <Badge
                  variant="outline"
                  className="mt-2 text-primary border-primary/20 bg-primary/5"
                >
                  {group}
                </Badge>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center p-3 rounded-xl bg-background/50 border border-border/50">
                  <span className="text-xs text-muted-foreground">Joined</span>
                  <span className="text-sm font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-xl bg-background/50 border border-border/50">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className="text-sm font-medium text-green-500">
                    Active
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <div className="flex-1 space-y-6 w-full">
            <Card className="border-border/50 shadow-xl shadow-primary/5 overflow-hidden ">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Account Information
                  </CardTitle>
                </div>
                <CardDescription>
                  Manage your personal details and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      Email Address
                    </label>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50 font-medium">
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Academic Group
                    </label>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border/50 font-medium">
                      {group}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5" />
                    ICS Calendar Link
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 rounded-lg bg-muted/50 border border-border/50 font-mono text-sm truncate">
                      {icsLink || "No link provided"}
                    </div>
                    {icsLink && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(icsLink)}
                        className="shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This link is used to synchronize your university schedule
                    with Qoldanba.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t border-border/50 flex flex-wrap gap-4 pt-4">
                <Button variant="secondary" size="sm" className="gap-2" asChild>
                  <a href="/onboarding">Update Details</a>
                </Button>
                {icsLink && (
                  <Button variant="ghost" size="sm" className="gap-2" asChild>
                    <a href={icsLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Test Link
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;

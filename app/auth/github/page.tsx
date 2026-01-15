import GitHubButton from "@/components/github-button";
import { SignUpForm } from "@/components/sign-up-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up with GitHub",
  description:
    "Create your Qoldanba account to start tracking your academic life.",
};

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* <SignUpForm /> */}
        <GitHubButton/>
      </div>
    </div>
  );
}

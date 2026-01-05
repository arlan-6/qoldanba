import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { Fugaz_One } from "next/font/google";
import { Badge } from "./ui/badge";
import { SidebarTrigger } from "./animate-ui/components/radix/sidebar";
import SidebarTriggerNav from "./sidebar-trigger-nav";

const fugaz_one = Fugaz_One({
	weight: "400",
	subsets: ["latin"],
});

export default async function Navigation() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		// [Modern UI Change 1: Electric Dark Theme] Change background to near-black/transparent glass
		<nav className="w-full flex justify-center border-b border-primary/20 h-16 bg-black/40 backdrop-blur-lg sticky top-0 z-50 transition-colors duration-300">
			<div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
				<div className="flex gap-8 items-center font-semibold">
					{" "}
					{/* Increased gap for clean separation */}
					{/* [Modern UI Change 2: Branding Accent] Use primary color for the logo */}
					<div className="">
						<Link
							href={"/"}
							className="text-2xl text-primary tracking-widest transition-colors hover:text-white"
							style={{ fontFamily: fugaz_one.style.fontFamily }}
						>
							Qoldanbα
						</Link>
						

						{/* <Badge
							title="work in progress"
							// className="bg-destructive"
							variant={"outline"}
						>
							α
						</Badge> */}
					</div>
					{/* Navigation Links */}
					<div className="hidden md:flex items-center gap-6 text-sm font-light text-gray-300">
						{" "}
						{/* Lightened font weight */}
						<Link
							href="/"
							className="transition-colors hover:text-primary hover:font-normal" // Highlight with Primary on hover
						>
							Home
						</Link>
						{/* <Link
							href="#features"
							className="transition-colors hover:text-primary hover:font-normal"
						>
							Features
						</Link> */}
						{user && (
							<Link
								href="/my"
								className="transition-colors hover:text-primary hover:font-normal"
							>
								Dashboard
							</Link>
						)}
					</div>
				</div>

				{/* Actions: AuthButton & ThemeSwitcher */}
				<div className="flex items-center gap-4">
					{/* Note: The AuthButton component style might need adjustment 
                        to fit the electric dark theme (e.g., if it uses the default 
                        Shadcn/ui primary button, it should become primary/outline). */}
					{!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
					<ThemeSwitcher />
					<SidebarTriggerNav />
				</div>
			</div>
		</nav>
	);
}

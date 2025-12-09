
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { Fugaz_One } from "next/font/google";

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
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                    <Link href={"/"} className="text-2xl " style={{ fontFamily: fugaz_one.style.fontFamily }}>
                        Qoldanba
                    </Link>
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/" className="transition-colors hover:text-foreground">
                            Home
                        </Link>
                        <Link href="/about" className="transition-colors hover:text-foreground">
                            About
                        </Link>
                        <Link href="/contact" className="transition-colors hover:text-foreground">
                            Contact
                        </Link>
                        {user && (
                            <Link
                                href="/my"
                                className="transition-colors hover:text-foreground"
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
                    <ThemeSwitcher />
                </div>
            </div>
        </nav>
    );
}

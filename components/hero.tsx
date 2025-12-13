import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
	return (
		<div className="flex flex-col items-center text-center pt-20 pb-16 px-4 md:px-6 lg:pt-32 lg:pb-24">
			<div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-8">
				<span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
				v1.0 is now live
			</div>
			<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl mx-auto bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
				Your Intelligent Academic Autopilot
			</h1>
			<p className="mt-6 max-w-[42rem] mx-auto text-muted-foreground sm:text-xl">
				Centralize your university life. Automatically sync deadlines from your
				LMS and view your class schedule in one beautiful, distraction-free
				dashboard.
			</p>
			<div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
				<Link href="/auth/sign-up">
					<Button size="lg" className="w-full sm:w-auto gap-2">
						Get Started <ArrowRight className="h-4 w-4" />
					</Button>
				</Link>
				<Link href="#features">
					<Button variant="outline" size="lg" className="w-full sm:w-auto">
						Learn More
					</Button>
				</Link>
			</div>

			<div className="mt-20 w-full max-w-5xl mx-auto relative">
				<div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20"></div>
				<div className="relative rounded-xl border bg-background/50 backdrop-blur-sm p-4 shadow-2xl">
					<img
						src="https://placehold.co/1200x600/png?text=Qoldanba+Dashboard+Preview"
						alt="Dashboard Preview"
						className="rounded-lg w-full h-auto border shadow-sm"
					/>
				</div>
			</div>
		</div>
	);
}

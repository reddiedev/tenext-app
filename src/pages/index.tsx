import Image from "next/image";
import {
	ArrowRight,
	Building2Icon,
	CheckCircle2,
	Sparkles,
} from "lucide-react";
import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { SiteFooter } from "~/components/site-footer";
const features = [
	{ id: 1, name: "24/7 AI-powered support" },
	{ id: 2, name: "Reduce response time by 80%" },
	{ id: 3, name: "Seamless integration" },
	{ id: 4, name: "Multilingual capabilities" },
];

export function HeroSection() {
	return (
		<div className="relative overflow-hidden pt-32 pb-16 md:pb-24 lg:pb-32">
			{/* Background gradient */}
			<div className="-z-10 absolute inset-0 bg-[radial-gradient(45%_40%_at_50%_30%,rgba(124,58,237,0.1),transparent)]" />

			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
					<div className="flex flex-col space-y-8">
						<Badge className="w-fit bg-indigo-100 text-indigo-800 transition-colors hover:bg-indigo-200">
							<Sparkles className="mr-1 h-3.5 w-3.5" />
							AI-Powered Customer Support
						</Badge>

						<div className="space-y-4">
							<h1 className="font-bold text-4xl tracking-tight md:text-5xl lg:text-6xl">
								Transform your customer service with AI
							</h1>
							<p className="max-w-lg text-gray-600 text-lg md:text-xl">
								Deliver exceptional customer experiences with our AI-powered
								platform that resolves issues faster and delights your
								customers.
							</p>
						</div>

						<div className="flex flex-col gap-4 sm:flex-row">
							<Link href="/sign-in">
								<Button
									size="lg"
									className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
								>
									Start your free trial
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</Link>
							<Link href="/sign-in">
								<Button size="lg" variant="outline">
									Book a demo
								</Button>
							</Link>
						</div>

						<div className="flex flex-col items-start gap-4 pt-4 sm:flex-row sm:items-center">
							<div className="-space-x-2 flex">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-gray-200"
									>
										<Image
											src={"/placeholder.svg?height=32&width=32"}
											alt={`User ${i}`}
											width={32}
											height={32}
										/>
										<Building2Icon className="h-4 w-4" />
									</div>
								))}
							</div>
							<div className="text-gray-600 text-sm">
								<span className="font-medium">500+ companies</span> trust AiDesk
							</div>
						</div>

						<div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
							{features.map((feature) => (
								<div key={feature.id} className="flex items-center gap-2">
									<CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500" />
									<span className="text-sm">{feature.name}</span>
								</div>
							))}
						</div>
					</div>

					<div className="relative">
						<div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-2xl">
							<div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-50">
								<Image
									src="https://plus.unsplash.com/premium_photo-1661582120130-03b9bdc47a75?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
									alt="AI Customer Service Dashboard"
									width={800}
									height={600}
									className="object-cover"
									priority
								/>
							</div>
						</div>

						{/* Decorative elements */}
						<div className="-z-10 -top-6 -right-6 absolute h-24 w-24 rounded-full bg-indigo-100 opacity-70 blur-2xl" />
						<div className="-z-10 -bottom-8 -left-8 absolute h-32 w-32 rounded-full bg-violet-100 opacity-70 blur-2xl" />
					</div>
				</div>
			</div>

			{/* Trusted by logos */}
			<div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-8">
				<p className="mb-6 text-center font-medium text-gray-500 text-sm">
					TRUSTED BY INDUSTRY LEADERS
				</p>
				<div className="flex flex-wrap items-center justify-center gap-8 opacity-70 md:gap-12">
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-8">
							<Image
								src={`/placeholder.svg?height=32&width=${80 + i * 10}`}
								alt={`Company ${i} logo`}
								width={80 + i * 10}
								height={32}
								className="h-full w-auto grayscale"
							/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export default function Page() {
	return (
		<main>
			<HeroSection />
			<SiteFooter className="px-24" />
		</main>
	);
}

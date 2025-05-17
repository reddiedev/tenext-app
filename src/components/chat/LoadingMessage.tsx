import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import React, { useEffect, useState } from "react";

export function LoadingMessage() {
	const [dotCount, setDotCount] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setDotCount((prev) => (prev + 1) % 4);
		}, 400);

		return () => clearInterval(interval);
	}, []);

	// Render the appropriate number of dots with animations
	const renderDots = () => {
		return (
			<span className="inline-flex w-[24px] ml-1">
				<span
					className={`transition-opacity duration-300 ${dotCount >= 1 ? "opacity-100" : "opacity-0"}`}
				>
					.
				</span>
				<span
					className={`transition-opacity duration-300 ${dotCount >= 2 ? "opacity-100" : "opacity-0"}`}
				>
					.
				</span>
				<span
					className={`transition-opacity duration-300 ${dotCount >= 3 ? "opacity-100" : "opacity-0"}`}
				>
					.
				</span>
			</span>
		);
	};

	return (
		<div className="flex gap-3 mb-4">
			<div className="animate-pulse duration-1000">
				<Avatar className="h-8 w-8">
					<AvatarImage src="/logo-blue.png" alt="Agent" />
					<AvatarFallback>A</AvatarFallback>
				</Avatar>
			</div>
			<div className="flex flex-col">
				<div className="rounded-lg rounded-tl-none bg-primary/10 px-4 py-2 text-sm w-fit">
					<span className="font-medium">Thinking{renderDots()}</span>
				</div>
			</div>
		</div>
	);
}

// Add this to your globals.css or create a new style tag in a layout component
export const loadingAnimation = `
@keyframes loading {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
`;

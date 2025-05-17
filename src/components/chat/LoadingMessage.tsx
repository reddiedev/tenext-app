import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Skeleton } from "~/components/ui/skeleton";

export function LoadingMessage() {
	return (
		<div className="flex gap-2">
			<Avatar className="h-8 w-8">
				<AvatarImage
					src="/placeholder.svg?height=32&width=32&query=A"
					alt="Agent"
				/>
				<AvatarFallback>A</AvatarFallback>
			</Avatar>
			<div className="flex flex-col gap-2 max-w-3xl">
				<Skeleton className="h-4 w-[250px]" />
				<Skeleton className="h-4 w-[200px]" />
				<Skeleton className="h-4 w-[150px]" />
			</div>
		</div>
	);
}

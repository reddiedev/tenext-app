import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { Message } from "~/types/chat";
import { MarkdownContent } from "./MarkdownContent";

interface MessageBoxProps {
	message: Message;
}

export function MessageBox({ message }: MessageBoxProps) {
	return (
		<div
			className={cn(
				"flex gap-2 w-full",
				message.isCurrentUser && "justify-end",
			)}
		>
			{!message.isCurrentUser && (
				<Avatar className="h-8 w-8 flex-shrink-0">
					<AvatarImage src={message.avatar} alt={message.sender} />
					<AvatarFallback>
						{message.sender
							.split(" ")
							.map((n: string) => n[0])
							.join("")}
					</AvatarFallback>
				</Avatar>
			)}
			<div className="flex flex-col min-w-0 max-w-[80%]">
				<Card
					className={cn(
						"w-fit max-w-full",
						message.isCurrentUser
							? "bg-primary text-primary-foreground"
							: "bg-muted",
						"py-0",
					)}
				>
					<CardContent className="px-3 py-2 overflow-hidden">
						<MarkdownContent
							content={message.content}
							className={cn(
								"break-words",
								message.isCurrentUser &&
									"text-primary-foreground [&_code]:bg-primary-foreground/20 [&_pre]:bg-primary-foreground/20",
							)}
						/>
					</CardContent>
				</Card>
				<span className="mt-1 text-xs text-muted-foreground">
					{message.timestamp}
				</span>
			</div>
		</div>
	);
}

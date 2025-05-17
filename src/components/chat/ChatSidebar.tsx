import React from "react";
import { cn } from "~/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { MessageSquare } from "lucide-react";
import type { Thread } from "~/types/chat";

interface ChatSidebarProps {
	threads: Thread[];
	activeThreadId: number;
	onThreadSelect: (threadId: number) => void;
}

export function ChatSidebar({
	threads,
	activeThreadId,
	onThreadSelect,
}: ChatSidebarProps) {
	return (
		<div className="w-1/3 border-r">
			<div className="p-4 font-semibold">
				<div className="flex items-center">
					<MessageSquare className="mr-2 h-5 w-5" />
					<h2>Conversations</h2>
				</div>
			</div>
			<Separator />
			<ScrollArea className="h-[calc(600px-57px)]">
				{threads.map((thread) => (
					<div
						key={thread.id}
						className={cn(
							"flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/50",
							activeThreadId === thread.id && "bg-muted",
						)}
						onClick={() => onThreadSelect(thread.id)}
					>
						<Avatar>
							<AvatarImage src={thread.avatar} alt={thread.name} />
							<AvatarFallback>
								{thread.name
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 overflow-hidden">
							<div className="flex items-center justify-between">
								<p className="font-medium">{thread.name}</p>
								{thread.unread > 0 && (
									<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
										{thread.unread}
									</span>
								)}
							</div>
							<p className="truncate text-sm text-muted-foreground">
								{thread.lastMessage}
							</p>
						</div>
					</div>
				))}
			</ScrollArea>
		</div>
	);
}

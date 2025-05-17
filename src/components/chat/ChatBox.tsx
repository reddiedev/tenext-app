import React, { useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { Thread } from "~/types/chat";

interface ChatBoxProps {
	activeThread: Thread | undefined;
	onSendMessage: (message: string) => void;
	className?: string;
}

export function ChatBox({
	activeThread,
	onSendMessage,
	className,
}: ChatBoxProps) {
	const [newMessage, setNewMessage] = useState("");

	const handleSendMessage = () => {
		if (!newMessage.trim()) return;
		onSendMessage(newMessage);
		setNewMessage("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	if (!activeThread) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-muted-foreground">
					Select a conversation to start chatting
				</p>
			</div>
		);
	}

	return (
		<div className={cn("flex w-full flex-col", className)}>
			{/* Chat header */}
			<div className="border-b p-3">
				<div className="flex items-center gap-2">
					<Avatar>
						<AvatarImage src={activeThread.avatar} alt={activeThread.name} />
						<AvatarFallback>
							{activeThread.name
								.split(" ")
								.map((n: string) => n[0])
								.join("")}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-medium">{activeThread.name}</p>
					</div>
				</div>
			</div>

			{/* Messages */}
			<ScrollArea className="flex-1 p-4">
				<div className="flex flex-col gap-3">
					{activeThread.messages.map((message) => (
						<div
							key={message.id}
							className={cn(
								"flex gap-2",
								message.isCurrentUser && "justify-end",
							)}
						>
							{!message.isCurrentUser && (
								<Avatar className="h-8 w-8">
									<AvatarImage src={message.avatar} alt={message.sender} />
									<AvatarFallback>
										{message.sender
											.split(" ")
											.map((n: string) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
							)}
							<div className="flex flex-col">
								<Card
									className={cn(
										"max-w-3xl",
										message.isCurrentUser
											? "bg-primary text-primary-foreground"
											: "bg-muted",
										"py-0",
									)}
								>
									<CardContent className="px-3 py-2">
										<p>{message.content}</p>
									</CardContent>
								</Card>
								<span className="mt-1 text-xs text-muted-foreground">
									{message.timestamp}
								</span>
							</div>
						</div>
					))}
				</div>
			</ScrollArea>

			{/* Message input */}
			<div className="border-t p-3">
				<div className="flex gap-2">
					<Input
						placeholder="Type a message..."
						value={newMessage}
						onChange={(e) => setNewMessage(e.target.value)}
						onKeyDown={handleKeyDown}
						className="flex-1"
					/>
					<Button onClick={handleSendMessage}>Send</Button>
				</div>
			</div>
		</div>
	);
}

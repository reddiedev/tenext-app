import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import type { UIMessage, UIThread } from "~/types/chat";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { LoadingMessage } from "./LoadingMessage";
import { MessageBox } from "./MessageBox";

interface ChatBoxProps {
	activeThread: UIThread | undefined;
	messages: UIMessage[];
	onSendMessage: (message: string) => void;

	isLoading?: boolean;
	className?: string;
}

export function ChatBox({
	activeThread,
	messages,
	onSendMessage,

	isLoading,
	className,
}: ChatBoxProps) {
	const [newMessage, setNewMessage] = useState("");

	const handleSendMessage = () => {
		if (!newMessage.trim()) return;
		onSendMessage(newMessage);
		setNewMessage("");
	};

	// console.log("chatbox streamingMessage", streamingMessage);

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
		<Card
			className={cn("flex w-full flex-col space-y-0 gap-0 p-4 ", className)}
		>
			{/* Chat header */}
			<CardHeader className="p-0 space-y-0 gap-0">
				<CardTitle className=" p-0">{activeThread.title}</CardTitle>
				<CardDescription className=" p-0">
					{activeThread.isManualIntervention
						? "Manual Intervention"
						: "Automatic Intervention"}
				</CardDescription>
			</CardHeader>

			{/* Messages */}
			<ScrollArea className="flex-1 p-4 max-h-[35rem] min-h-[35rem]">
				<div className="flex flex-col gap-3">
					{messages.map((message) => (
						<MessageBox key={message.id} message={message} />
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
		</Card>
	);
}

import React, { useState } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { MessageSquare } from "lucide-react";

// Sample data for threads and messages
const initialThreads = [
	{
		id: 1,
		name: "Alice Smith",
		avatar: "/placeholder.svg?height=40&width=40&query=A",
		lastMessage: "Hey, how's it going?",
		unread: 2,
		messages: [
			{
				id: 1,
				sender: "Alice Smith",
				avatar: "/placeholder.svg?height=40&width=40&query=A",
				content: "Hey, how's it going?",
				timestamp: "10:30 AM",
				isCurrentUser: false,
			},
			{
				id: 2,
				sender: "You",
				content: "Not bad! Working on that project we discussed.",
				timestamp: "10:32 AM",
				isCurrentUser: true,
			},
			{
				id: 3,
				sender: "Alice Smith",
				avatar: "/placeholder.svg?height=40&width=40&query=A",
				content: "How's the progress? Need any help?",
				timestamp: "10:33 AM",
				isCurrentUser: false,
			},
		],
	},
	{
		id: 2,
		name: "Bob Johnson",
		avatar: "/placeholder.svg?height=40&width=40&query=B",
		lastMessage: "Can you send me those files?",
		unread: 0,
		messages: [
			{
				id: 1,
				sender: "Bob Johnson",
				avatar: "/placeholder.svg?height=40&width=40&query=B",
				content: "Can you send me those files?",
				timestamp: "Yesterday",
				isCurrentUser: false,
			},
			{
				id: 2,
				sender: "You",
				content: "Sure, I'll email them to you shortly.",
				timestamp: "Yesterday",
				isCurrentUser: true,
			},
		],
	},
	{
		id: 3,
		name: "Team Chat",
		avatar: "/placeholder.svg?height=40&width=40&query=TC",
		lastMessage: "Meeting at 3pm tomorrow",
		unread: 5,
		messages: [
			{
				id: 1,
				sender: "Carol Davis",
				avatar: "/placeholder.svg?height=40&width=40&query=C",
				content: "Meeting at 3pm tomorrow",
				timestamp: "Yesterday",
				isCurrentUser: false,
			},
			{
				id: 2,
				sender: "Dave Wilson",
				avatar: "/placeholder.svg?height=40&width=40&query=D",
				content: "I'll be there!",
				timestamp: "Yesterday",
				isCurrentUser: false,
			},
			{
				id: 3,
				sender: "You",
				content: "Thanks for the heads up.",
				timestamp: "Yesterday",
				isCurrentUser: true,
			},
		],
	},
];

export default function Page() {
	const [threads, setThreads] = useState(initialThreads);
	const [activeThreadId, setActiveThreadId] = useState(1);
	const [newMessage, setNewMessage] = useState("");

	const activeThread = threads.find((thread) => thread.id === activeThreadId);

	const handleSendMessage = () => {
		if (!newMessage.trim()) return;

		const updatedThreads = threads.map((thread) => {
			if (thread.id === activeThreadId) {
				return {
					...thread,
					messages: [
						...thread.messages,
						{
							id: thread.messages.length + 1,
							sender: "You",
							content: newMessage,
							timestamp: "Just now",
							isCurrentUser: true,
						},
					],
					lastMessage: newMessage,
				};
			}
			return thread;
		});

		setThreads(updatedThreads);
		setNewMessage("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	return (
		<div className="flex h-[600px] w-full max-w-4xl rounded-lg border bg-background shadow">
			{/* Sidebar with threads */}
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
							onClick={() => setActiveThreadId(thread.id)}
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

			{/* Main chat area */}
			<div className="flex w-2/3 flex-col">
				{activeThread ? (
					<>
						{/* Chat header */}
						<div className="border-b p-3">
							<div className="flex items-center gap-2">
								<Avatar>
									<AvatarImage
										src={activeThread.avatar}
										alt={activeThread.name}
									/>
									<AvatarFallback>
										{activeThread.name
											.split(" ")
											.map((n) => n[0])
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
												<AvatarImage
													src={message.avatar}
													alt={message.sender}
												/>
												<AvatarFallback>
													{message.sender
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
										)}
										<div className="flex flex-col">
											<Card
												className={cn(
													"max-w-[80%]",
													message.isCurrentUser
														? "bg-primary text-primary-foreground"
														: "bg-muted",
												)}
											>
												<CardContent className="p-3">
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
					</>
				) : (
					<div className="flex h-full items-center justify-center">
						<p className="text-muted-foreground">
							Select a conversation to start chatting
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

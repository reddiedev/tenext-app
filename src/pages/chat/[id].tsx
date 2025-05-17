import React, { useState } from "react";
import { ChatSidebar } from "~/components/chat/ChatSidebar";
import { ChatBox } from "~/components/chat/ChatBox";
import { useRouter } from "next/router";

import type { GetServerSideProps, NextPage } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
	// Extract the id parameter from the URL
	const { id } = context.params!;

	return {
		props: { id },
	};
};

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

export default function Page({ id }: { id: string }) {
	const router = useRouter();

	const [threads, setThreads] = useState(initialThreads);
	const [activeThreadId, setActiveThreadId] = useState(parseInt(id));

	const activeThread = threads.find((thread) => thread.id === activeThreadId);

	const handleThreadSelect = (threadId: number) => {
		setActiveThreadId(threadId);
		router.push(`/chat/${threadId}`);
	};

	const handleSendMessage = (newMessage: string) => {
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
	};

	return (
		<div className="flex flex-col min-h-screen w-full h-auto rounded-lg border bg-background">
			{/* <ChatSidebar
				threads={threads}
				activeThreadId={activeThreadId}
				onThreadSelect={handleThreadSelect}
			/> */}
			<div className="grid grid-cols-2 gap-2 p-2 w-full h-full grow">
				<ChatBox
					activeThread={activeThread}
					onSendMessage={handleSendMessage}
				/>
			</div>
		</div>
	);
}

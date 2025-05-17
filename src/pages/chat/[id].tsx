import { useRouter } from "next/router";
import { useState } from "react";
import { ChatBox } from "~/components/chat/ChatBox";

import axios, { type AxiosResponse } from "axios";
import type { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { AppHeader } from "../dashboard";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { StepBackIcon } from "lucide-react";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await auth(context);

	if (!session) {
		return {
			redirect: { destination: "/sign-in", permanent: false },
		};
	}

	const email = session.user.email;
	const password = "password";

	const registerResponse = await axios
		.post(env.NEXT_PUBLIC_BACKEND_URL + "/auth/register", {
			email,
			password,
		})
		.catch(console.error);

	const loginResponse: AxiosResponse<{ message: string }> = await axios.post(
		env.NEXT_PUBLIC_BACKEND_URL + "/auth/login",
		{
			email,
			password,
		},
	);

	const accessToken = loginResponse.data.message;

	context.res.setHeader("Set-Cookie", [
		`access_token=${loginResponse.data.message}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,
	]);

	// Extract the id parameter from the URL
	const { id } = context.params!;

	return {
		props: { id },
	};
};

type Message = {
	id: number;
	sender: string;
	avatar?: string;
	content: string;
	timestamp: string;
	isCurrentUser: boolean;
};

type Thread = {
	id: number;
	name: string;
	avatar: string;
	lastMessage: string;
	unread: number;
	messages: Message[];
};

export default function Page({ id }: { id: string }) {
	const router = useRouter();
	const { data: session } = useSession();
	const [threads, setThreads] = useState<Thread[]>([]);
	const [streamingMessage, setStreamingMessage] = useState<string>("");
	const [isStreaming, setIsStreaming] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const activeThreadId = parseInt(id);
	const activeThread = threads.find((thread) => thread.id === activeThreadId);

	const handleSendMessage = async (newMessage: string) => {
		const currentCount = threads.length;

		// Add user message immediately
		const prevUpdatedThreads = threads.map((thread) => {
			if (thread.id === activeThreadId) {
				return {
					...thread,
					messages: [
						...thread.messages,
						{
							id: currentCount + 1,
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

		setThreads(prevUpdatedThreads);
		setIsStreaming(true);
		setIsLoading(true);
		setStreamingMessage("");

		try {
			if (!session) {
				return;
			}

			const loginResponse = await fetch(
				`${env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: session?.user.email,
						password: "password",
					}),
				},
			);

			if (!loginResponse.ok) {
				console.error("Login failed:", await loginResponse.text());
				throw new Error("Login failed");
			}

			const loginData = await loginResponse.json();
			const accessToken = loginData.message;

			if (!accessToken) {
				throw new Error("No access token found");
			}

			// Create streaming request
			const response = await fetch(
				`${env.NEXT_PUBLIC_BACKEND_URL}/agent/v1/chat_stream`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
					body: JSON.stringify({
						message: newMessage,
						session_id: `thread-${id}`,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();

			if (!reader) {
				throw new Error("No reader available");
			}

			// Track the complete message outside of React state
			let completeMessage = "";

			try {
				while (true) {
					const { done, value } = await reader.read();

					if (done) {
						break;
					}

					// Decode the stream chunk and split by newlines
					const chunk = decoder.decode(value, { stream: true });
					const lines = chunk.split("\n").filter((line) => line.trim());

					// Process each line
					for (const line of lines) {
						try {
							const data = JSON.parse(line);
							completeMessage += data.content || "";
							// Update UI with current progress
							setStreamingMessage(completeMessage);
							setIsLoading(false); // Hide loading state once we start receiving content
						} catch (error) {
							console.error("Error parsing stream data:", error);
						}
					}
				}

				// Ensure we have the final message before proceeding
				console.log("Stream complete, final message:", completeMessage);

				// Update threads with the complete message
				setThreads((prevThreads) =>
					prevThreads.map((thread) => {
						if (thread.id === activeThreadId) {
							return {
								...thread,
								messages: [
									...thread.messages,
									{
										id: currentCount + 2,
										sender: "Agent",
										content: completeMessage,
										timestamp: "Just now",
										isCurrentUser: false,
									},
								],
								lastMessage: completeMessage,
							};
						}
						return thread;
					}),
				);
			} catch (error) {
				console.error("Error reading stream:", error);
				throw error;
			} finally {
				reader.releaseLock();
				setIsStreaming(false);
				setIsLoading(false);
				setStreamingMessage(""); // Clear the streaming message
			}
		} catch (error) {
			console.error("Error in streaming:", error);
			setIsStreaming(false);
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen w-full h-auto rounded-lg border bg-background">
			{/* <ChatSidebar
				threads={threads}
				activeThreadId={activeThreadId}
				onThreadSelect={handleThreadSelect}
			/> */}
			<AppHeader />
			<div className="flex items-center justify-between px-5 pt-2">
				<Link href="/chat">
					<Button className="py-1 h-auto">
						<StepBackIcon className="size-4" />
						Back to Chats
					</Button>
				</Link>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 w-full h-full grow">
				<ChatBox
					activeThread={activeThread}
					onSendMessage={handleSendMessage}
					streamingMessage={streamingMessage}
					isLoading={isLoading}
				/>
			</div>
		</div>
	);
}

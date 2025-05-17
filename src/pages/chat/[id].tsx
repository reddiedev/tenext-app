import { useEffect, useState } from "react";
import { ChatBox } from "~/components/chat/ChatBox";

import axios from "axios";
import { StepBackIcon } from "lucide-react";
import type { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import KnowledgeBaseWidget from "~/components/chat/KnowledgeBaseWidget";
import SiteFooter from "~/components/site-footer";
import AppHeader from "~/components/site-header";
import { Button } from "~/components/ui/button";
import { Card, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import type { UIMessage } from "~/types/chat";
import { api } from "~/utils/api";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await auth(context);

	if (!session) {
		return {
			redirect: { destination: "/sign-in", permanent: false },
		};
	}

	let accessToken = session.user.accessToken;
	if (!accessToken) {
		const email = session.user.email;
		const password = "password";

		await axios
			.post(env.NEXT_PUBLIC_BACKEND_URL + "/auth/register", {
				email,
				password,
			})
			.catch(console.error);

		const loginResponse = await axios.post(
			env.NEXT_PUBLIC_BACKEND_URL + "/auth/login",
			{
				email,
				password,
			},
		);

		accessToken = loginResponse.data.message;

		if (accessToken) {
			await db.user.update({
				where: { id: session.user.id },
				data: { accessToken },
			});
		}
	}

	// Extract the id parameter from the URL
	const { id } = context.params!;

	return {
		props: { threadId: id },
	};
};

export default function Page({ threadId }: { threadId: string }) {
	const { data: session } = useSession();

	const [messages, setMessages] = useState<UIMessage[]>([]);

	const [streamingMessage, setStreamingMessage] = useState<string>("");
	const [rateAgentMessage, setRateAgentMessage] = useState<string>("");
	const [suggestAgentMessage, setSuggestAgentMessage] = useState<string>("");
	const [solutionAgentMessage, setSolutionAgentMessage] = useState<string>("");

	const [isLoading, setIsLoading] = useState(false);

	const { data: activeThread } = api.agent.getThread.useQuery({ threadId });

	const { data: activeMessages } = api.agent.getThreadMessages.useQuery(
		{
			threadId,
		},
		{
			enabled: activeThread?.isManualIntervention,
			refetchInterval: 1000,
			refetchIntervalInBackground: true,
			refetchOnWindowFocus: true,
		},
	);

	useEffect(() => {
		// TODO fix the transition
		if (activeMessages) {
			setMessages([...activeMessages]);
		}
	}, [activeMessages]);

	useEffect(() => {
		if (activeThread) {
			setMessages([...activeThread.messages]);
		}
	}, [activeThread]);

	const handleSendMessageToCompletion = async (newMessage: string) => {
		const currentCount = messages.length;

		const senderRole = session?.user.role == "user" ? "customer" : "csr";

		setMessages((prevMessages) => {
			return [
				...prevMessages,
				{
					id: currentCount + 1,
					sender: session?.user.name || "You",
					avatar: session?.user.image || "",
					content: newMessage,
					timestamp: new Date().toISOString(),
					role: senderRole,
					isCurrentUser: true,
				},
			];
		});

		// call endpoint for creating message

		if (senderRole == "csr") {
			return;
		}

		setIsLoading(true);
		setStreamingMessage("");

		try {
			if (!session || !session.user.accessToken) {
				return;
			}

			// Create streaming request
			const response = await fetch(
				`${env.NEXT_PUBLIC_BACKEND_URL}/agent/v1/chat_stream`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${session.user.accessToken}`,
					},
					body: JSON.stringify({
						message: newMessage,
						session_id: `thread-${threadId}`,
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

				// Update threads with the complete message
				setMessages((prevMessages) => {
					return [
						...prevMessages,
						{
							id: currentCount + 2,
							sender: "Path",
							content: completeMessage,
							timestamp: new Date().toISOString(),
							role: "assistant",
							isCurrentUser: false,
							avatar: "/logo-blue.png",
						},
					];
				});
			} catch (error) {
				console.error("Error reading stream:", error);
				throw error;
			} finally {
				reader.releaseLock();
				setIsLoading(false);
				setStreamingMessage(""); // Clear the streaming message
			}
		} catch (error) {
			console.error("Error in streaming:", error);
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen w-full h-auto rounded-lg border bg-background">
			<AppHeader />
			<div className="flex items-center justify-end px-5 pt-2">
				<Button asChild className="py-2 h-auto">
					<Link href="/chats">
						<StepBackIcon className="size-4 mr-2" />
						Back to Chats
					</Link>
				</Button>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 w-full h-full grow">
				{activeThread && (
					<ChatBox
						activeThread={activeThread}
						messages={messages}
						onSendMessage={handleSendMessageToCompletion}
						streamingMessage={streamingMessage}
						isLoading={isLoading}
					/>
				)}
				{!activeThread && (
					<Card className="w-full h-full p-4 gap-2">
						<Skeleton className="w-full h-full" />
					</Card>
				)}
				{session?.user.role !== "user" && (
					<Card className="w-full h-full p-4 gap-2 flex flex-col">
						<div className="grid grid-cols-2 gap-2">
							<div className="flex flex-col space-y-1">
								<CardTitle className="p-0">Summary</CardTitle>
								<Skeleton className="w-full min-h-32 h-full" />
							</div>
							<div className="flex flex-col space-y-1">
								<CardTitle className="p-0">Knowledge Base</CardTitle>
								<KnowledgeBaseWidget />
							</div>
						</div>

						<CardTitle className="p-0 pt-5">Tools</CardTitle>
						<div className="grid grid-cols-2 gap-2">
							<div className="flex flex-col space-y-1">
								<CardTitle className="p-0">
									Support Quality (rate_agent)
								</CardTitle>
								<Skeleton className="w-full h-32" />
							</div>
							<div className="flex flex-col space-y-1">
								<CardTitle className="p-0">
									Empathy Score (suggest_agent )
								</CardTitle>
								<Skeleton className="w-full h-32" />
							</div>
						</div>

						<div className="flex flex-col space-y-1 grow">
							<CardTitle className="p-0">
								Solutions Builder (solution_agent)
							</CardTitle>
							<Skeleton className="w-full min-h-32 h-full" />
						</div>
					</Card>
				)}
			</div>
			<SiteFooter />
		</div>
	);
}

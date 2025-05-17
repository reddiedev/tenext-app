import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ChatBox } from "~/components/chat/ChatBox";

import axios, { type AxiosResponse } from "axios";
import { StepBackIcon } from "lucide-react";
import type { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AppHeader from "~/components/site-header";
import { Button } from "~/components/ui/button";
import { Card, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { env } from "~/env";
import { auth } from "~/server/auth";
import type { UIMessage, UIThread } from "~/types/chat";
import { api } from "~/utils/api";
import SiteFooter from "~/components/site-footer";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await auth(context);

	if (!session) {
		return {
			redirect: { destination: "/sign-in", permanent: false },
		};
	}

	const email = session.user.email;
	const password = "password";

	let accessToken = context.req.cookies.access_token;

	if (!accessToken) {
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

		accessToken = loginResponse.data.message;
	}

	context.res.setHeader("Set-Cookie", [
		`access_token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,
	]);

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

	const [isLoading, setIsLoading] = useState(false);

	const { data: activeThread } = api.agent.getThread.useQuery({ threadId });

	useEffect(() => {
		if (activeThread) {
			setMessages([...activeThread.messages]);
		}
	}, [activeThread]);

	console.log("messages:", messages);

	const handleSendMessage = async (newMessage: string) => {
		console.log("messages:", messages);
		console.log("adding new message:", newMessage);
		const currentCount = messages.length;

		setMessages((prevMessages) => {
			return [
				...prevMessages,
				{
					id: currentCount + 1,
					sender: "user",
					content: newMessage,
					timestamp: new Date().toISOString(),
					role: "user",
					isCurrentUser: true,
				},
			];
		});

		setIsLoading(true);
		setStreamingMessage("");

		try {
			if (!session) {
				return;
			}

			let accessToken = document.cookie
				.split("; ")
				.find((row) => row.startsWith("access_token="))
				?.split("=")[1];

			if (!accessToken) {
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
				accessToken = loginData.message;
			}

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

				// Ensure we have the final message before proceeding
				console.log("Stream complete, final message:", completeMessage);
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
						onSendMessage={handleSendMessage}
						streamingMessage={streamingMessage}
						isLoading={isLoading}
					/>
				)}
				{!activeThread && (
					<Card className="w-full h-full p-4 gap-2">
						<Skeleton className="w-full h-full" />
					</Card>
				)}
				<Card className="w-full h-full p-4 gap-2">
					<CardTitle className="p-0">Assistant</CardTitle>
					<Skeleton className="w-full h-32" />

					<CardTitle className="p-0">Knowledge Base</CardTitle>
					<Skeleton className="w-full h-32" />

					<CardTitle className="p-0">Notes</CardTitle>
					<Skeleton className="w-full h-32" />

					<CardTitle className="p-0">Tools</CardTitle>
					<Skeleton className="w-full min-h-32 grow" />
				</Card>
			</div>
			<SiteFooter />
		</div>
	);
}

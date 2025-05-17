import { useEffect, useState } from "react";
import { ChatBox } from "~/components/chat/ChatBox";
import axios from "axios";
import { EditIcon, StepBackIcon } from "lucide-react";
import type { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import KnowledgeBaseWidget from "~/components/chat/KnowledgeBaseWidget";
import SiteFooter from "~/components/site-footer";
import AppHeader from "~/components/site-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import type { UIMessage } from "~/types/chat";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { MarkdownContent } from "~/components/chat/MarkdownContent";

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
	const [processedMessages, setProcessedMessages] = useState<number[]>([]);

	const [rateAgentMessage, setRateAgentMessage] = useState<string>("");
	const [suggestAgentMessage, setSuggestAgentMessage] = useState<string>("");
	const [solutionAgentMessage, setSolutionAgentMessage] = useState<string>("");

	console.log("rateAgentMessage: ", rateAgentMessage);
	console.log("suggestAgentMessage: ", suggestAgentMessage);
	console.log("solutionAgentMessage: ", solutionAgentMessage);

	const [isLoading, setIsLoading] = useState(false);

	const { data: activeThread } = api.agent.getThread.useQuery(
		{ threadId },
		{
			refetchInterval: 5000,
		},
	);
	const saveMessageMutation = api.agent.saveThreadMessage.useMutation();

	const manualInterventionMutation =
		api.agent.interveneWithThread.useMutation();

	useEffect(() => {
		console.log("activeThread effect", activeThread);

		if (activeThread) {
			setMessages([...activeThread.messages]);
		}
	}, [activeThread]);

	useEffect(() => {
		if (messages.length > 0) {
			const lastMessage = messages[messages.length - 1];

			if (lastMessage && !processedMessages.includes(lastMessage.id)) {
				getAIStreamingResponse(lastMessage.content, lastMessage.role);
				setProcessedMessages((prev) => [...prev, lastMessage.id]);
			}
		}
	}, [messages]);

	async function getAIStreamingResponse(newMessage: string, role: string) {
		console.log(`getAIStreamingResponse: ${newMessage}`);
		setIsLoading(true);

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
						speaking_user: role,
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
			let completeRateAgentMessage = "";
			let completeSuggestAgentMessage = "";
			let completeSolutionAgentMessage = "";

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
							const source: "rate_agent" | "solution_agent" | "suggest_agent" =
								data.source;

							if (source == "rate_agent") {
								completeRateAgentMessage += data.content || "";
							} else if (source == "solution_agent") {
								completeSolutionAgentMessage += data.content || "";
							} else if (source == "suggest_agent") {
								completeSuggestAgentMessage += data.content || "";
							}

							if (completeRateAgentMessage.length > 0) {
								setRateAgentMessage(completeRateAgentMessage);
							}
							if (completeSolutionAgentMessage.length > 0) {
								setSolutionAgentMessage(completeSolutionAgentMessage);
							}
							if (completeSuggestAgentMessage.length > 0) {
								setSuggestAgentMessage(completeSuggestAgentMessage);
							}

							setIsLoading(false); // Hide loading state once we start receiving content
						} catch (error) {
							continue;
						}
					}
				}
			} catch (error) {
				console.error("Error reading stream:", error);
				throw error;
			} finally {
				reader.releaseLock();
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Error in streaming:", error);
			setIsLoading(false);
		}
	}

	const handleNewSenderMessage = async (newMessage: string) => {
		const senderRole = session?.user.role == "user" ? "customer" : "csr";

		console.log(
			`[handleSendMessageToCompletion]: ${senderRole} is sending a message: ${newMessage}`,
		);

		setMessages((prevMessages) => {
			return [
				...prevMessages,
				{
					id: prevMessages.length + 1,
					sender: session?.user.name || "You",
					senderEmail: session?.user.email || "",
					avatar: session?.user.image || "",
					content: newMessage,
					timestamp: new Date().toISOString(),
					role: senderRole,
					isCurrentUser: true,
				},
			];
		});

		await saveMessageMutation.mutateAsync({
			sessionId: threadId,
			message: newMessage,
			role: senderRole,
		});
	};

	return (
		<div className="flex flex-col min-h-screen w-full h-auto rounded-lg border bg-background">
			<AppHeader />
			<div className="flex items-center justify-end px-5 pt-2 space-x-2">
				{session?.user.role !== "user" && (
					<Button
						onClick={async () => {
							toast.promise(
								async () => {
									await manualInterventionMutation.mutateAsync({
										threadId,
									});
								},
								{
									loading: "Intervening with thread...",
									success: "Thread intervened with successfully",
									error: "Failed to intervene with thread",
								},
							);
						}}
						className="py-2 h-auto"
					>
						<EditIcon className="size-4 mr-2" />
						Intervene Manually
					</Button>
				)}
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
						onSendMessage={handleNewSenderMessage}
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
								{rateAgentMessage !== "" && (
									<CardContent className="px-3 py-2 overflow-hidden">
										<MarkdownContent
											content={rateAgentMessage}
											className="break-words"
										/>
									</CardContent>
								)}
								{rateAgentMessage === "" && (
									<Skeleton className="w-full h-32" />
								)}
							</div>
							<div className="flex flex-col space-y-1">
								<CardTitle className="p-0">
									Empathy Score (suggest_agent )
								</CardTitle>
								{suggestAgentMessage !== "" && (
									<CardContent className="px-3 py-2 overflow-hidden">
										<MarkdownContent
											content={suggestAgentMessage}
											className="break-words"
										/>
									</CardContent>
								)}
								{suggestAgentMessage === "" && (
									<Skeleton className="w-full h-32" />
								)}
							</div>
						</div>

						<Card className="flex flex-col space-y-1 grow">
							<CardTitle className="p-0">
								Solutions Builder (solution_agent)
							</CardTitle>

							{solutionAgentMessage !== "" && (
								<CardContent className="px-3 py-2 overflow-hidden">
									<MarkdownContent
										content={solutionAgentMessage}
										className="break-words"
									/>
								</CardContent>
							)}

							{solutionAgentMessage === "" && (
								<Skeleton className="w-full min-h-32 h-full" />
							)}
						</Card>
					</Card>
				)}
			</div>
			<SiteFooter />
		</div>
	);
}

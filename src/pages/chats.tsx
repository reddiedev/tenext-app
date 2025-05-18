import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LayoutDashboardIcon, MessageSquare, PlusCircle } from "lucide-react";
import type { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import SiteFooter from "~/components/site-footer";
import AppHeader from "~/components/site-header";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { api } from "~/utils/api";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

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

	return {
		props: {},
	};
};

export default function ChatPage() {
	const { data: session } = useSession();
	console.log("session: /chats =", session);

	const router = useRouter();
	const { data: threads, isLoading } = api.agent.getRecentThreads.useQuery();

	const newChat = api.agent.createNewThread.useMutation();
	const handleCreateNewChat = async () => {
		const newThread = await newChat.mutateAsync();
		router.push(`/chat/${newThread.id}`);
	};

	return (
		<div className="flex flex-col min-h-screen">
			<AppHeader />
			<main className="flex-1 p-6">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-2xl font-bold">Recent Conversations</h1>
					<div>
						{session?.user.role !== "user" && (
							<Button asChild className="py-2 h-auto">
								<Link href="/dashboard">
									<LayoutDashboardIcon className="size-4 mr-2" />
									Back to Dashboard
								</Link>
							</Button>
						)}
						<Button
							onClick={handleCreateNewChat}
							className="flex items-center gap-2"
						>
							<PlusCircle className="size-4" />
							New Chat
						</Button>
					</div>
				</div>

				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<Card key={i} className="h-[200px] animate-pulse">
								<CardHeader className="bg-muted rounded-t-lg h-16"></CardHeader>
								<CardContent className="space-y-2 mt-4">
									<div className="h-4 bg-muted rounded w-3/4"></div>
									<div className="h-4 bg-muted rounded w-1/2"></div>
								</CardContent>
							</Card>
						))}
					</div>
				) : threads && threads.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{threads.map((thread) => (
							<Link
								key={thread.id}
								href={`/chat/${thread.id}`}
								className="block"
							>
								<Card className="h-full hover:shadow-md transition-shadow duration-200 cursor-pointer space-y-0 p-4">
									<CardHeader className="p-0">
										<div className="flex items-center gap-3">
											<div>
												<CardTitle className="text-lg">
													{thread.title}
												</CardTitle>
												<CardDescription>
													{thread.messages.length} messages
												</CardDescription>
											</div>
											{thread.messages.length > 0 &&
												thread.messages[thread.messages.length - 1]?.role ===
													"customer" && (
													<Badge variant="destructive" className="ml-auto">
														{thread.messages.length} new
													</Badge>
												)}
										</div>
									</CardHeader>
									<CardContent className="p-0">
										<p className="text-sm text-muted-foreground line-clamp-2">
											{thread.messages[thread.messages.length - 1]?.content}
										</p>
									</CardContent>
									<CardFooter className=" text-xs text-muted-foreground border-t p-0">
										<div className="flex items-center gap-1">
											<MessageSquare className="size-3" />
											<span>{thread.messages.length} messages</span>
										</div>
									</CardFooter>
								</Card>
							</Link>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<MessageSquare className="size-12 mx-auto text-muted-foreground mb-4" />
						<h2 className="text-xl font-semibold mb-2">No conversations yet</h2>
						<p className="text-muted-foreground mb-6">
							Start a new chat to begin a conversation
						</p>
						<Button onClick={handleCreateNewChat}>Start a new chat</Button>
					</div>
				)}
			</main>
			<SiteFooter />
		</div>
	);
}

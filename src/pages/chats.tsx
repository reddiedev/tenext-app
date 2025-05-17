import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { MessageSquare, PlusCircle } from "lucide-react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
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
import { api } from "~/utils/api";
import AppHeader from "~/components/site-header";
import SiteFooter from "~/components/site-footer";

// Initialize dayjs plugins
dayjs.extend(relativeTime);

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

		const loginResponse = await axios.post(
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

	return {
		props: {},
	};
};

export default function ChatPage() {
	const router = useRouter();
	const { data: threads, isLoading } = api.agent.getRecentThreads.useQuery();

	const formatTimestamp = (timestamp: Date | undefined) => {
		if (!timestamp) return "";
		try {
			return dayjs(timestamp).fromNow();
		} catch (error) {
			return timestamp;
		}
	};

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
					<Button
						onClick={handleCreateNewChat}
						className="flex items-center gap-2"
					>
						<PlusCircle className="size-4" />
						New Chat
					</Button>
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
												<CardDescription></CardDescription>
											</div>
											{thread.messages.length > 0 &&
												thread.messages[thread.messages.length - 1]?.role ===
													"user" && (
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

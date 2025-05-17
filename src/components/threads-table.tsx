import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import type { Message, Thread, User } from "@prisma/client";

type ThreadRow = Thread & {
	user?: User;
	messages: Message[];
};

export function ThreadsTable({ threads }: { threads: ThreadRow[] }) {
	if (!threads || threads.length === 0) {
		return (
			<div className="flex justify-center items-center h-32 border rounded-md">
				<p className="text-muted-foreground">No conversation threads found</p>
			</div>
		);
	}

	// Generate dummy data for the demo
	const getRandomInterventionScore = () => Math.floor(Math.random() * 100);

	// Get color based on intervention score
	const getInterventionColor = (score: number) => {
		if (score < 30) return "text-green-500";
		if (score < 70) return "text-amber-500";
		return "text-red-500";
	};

	// Format date to a readable string
	const formatDate = (date: Date) => {
		if (!(date instanceof Date)) {
			// Handle string date if needed
			date = new Date(date);
		}
		return new Intl.DateTimeFormat("en-US", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(date);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[250px]">ID</TableHead>
					<TableHead className="w-[250px]">User</TableHead>
					<TableHead className="w-[150px]">Messages</TableHead>
					<TableHead className="w-[150px]">Intervention Score</TableHead>
					<TableHead className="w-[150px]">Last Active</TableHead>
					<TableHead className="w-[150px]">Action</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{threads.map((thread) => {
					// Generate demo data - in a real app, this would come from the API
					const interventionScore = getRandomInterventionScore();
					const messageCount = thread.messages.length;

					return (
						<TableRow key={thread.cuid}>
							<TableCell>{thread.cuid}</TableCell>
							<TableCell>
								<div className="flex items-center space-x-3">
									<Avatar>
										<AvatarImage
											src={thread.user?.image || ""}
											alt={thread.user?.name || ""}
										/>
										<AvatarFallback>
											{thread.user?.name
												? thread.user.name.substring(0, 2).toUpperCase()
												: "??"}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium">
											{thread.user?.name || "Anonymous User"}
										</div>
										<div className="text-xs text-muted-foreground">
											{thread.user?.email ||
												`User ${thread.userId.substring(0, 8)}`}
										</div>
									</div>
								</div>
							</TableCell>
							<TableCell>{messageCount}</TableCell>
							<TableCell>
								<div
									className={`font-medium ${getInterventionColor(interventionScore)}`}
								>
									{interventionScore}
								</div>
							</TableCell>
							<TableCell>{formatDate(thread.updatedAt)}</TableCell>
							<TableCell>
								<Button variant="outline" size="sm" asChild>
									<Link href={`/chat/${thread.cuid}`}>Manual Intervention</Link>
								</Button>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}

export default ThreadsTable;

import React from "react";
import Image from "next/image";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type StaffUser = {
	id: string;
	name: string | null;
	email: string | null;
	image: string | null;
};

export function StaffUsersTable({ staffUsers }: { staffUsers: StaffUser[] }) {
	if (!staffUsers || staffUsers.length === 0) {
		return (
			<div className="flex justify-center items-center h-32 border rounded-md">
				<p className="text-muted-foreground">No staff users found</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[50px]"></TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>ID</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{staffUsers.map((user) => (
					<TableRow key={user.id}>
						<TableCell>
							<Avatar>
								<AvatarImage src={user.image || ""} alt={user.name || ""} />
								<AvatarFallback>
									{user.name ? user.name.substring(0, 2).toUpperCase() : "??"}
								</AvatarFallback>
							</Avatar>
						</TableCell>
						<TableCell className="font-medium">
							{user.name || "No name"}
						</TableCell>
						<TableCell>{user.email || "No email"}</TableCell>
						<TableCell className="text-xs text-muted-foreground">
							{user.id.substring(0, 8)}...
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

export default StaffUsersTable;

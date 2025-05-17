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
import { Badge } from "~/components/ui/badge";

type AdminUser = {
	id: string;
	name: string | null;
	email: string | null;
	image: string | null;
};

export function AdminUsersTable({ adminUsers }: { adminUsers: AdminUser[] }) {
	if (!adminUsers || adminUsers.length === 0) {
		return (
			<div className="flex justify-center items-center h-32 border rounded-md">
				<p className="text-muted-foreground">No admin users found</p>
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
					<TableHead>Role</TableHead>
					<TableHead>ID</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{adminUsers.map((user) => (
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
						<TableCell>
							<Badge variant="destructive">Admin</Badge>
						</TableCell>
						<TableCell className="text-xs text-muted-foreground">
							{user.id.substring(0, 8)}...
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

export default AdminUsersTable;

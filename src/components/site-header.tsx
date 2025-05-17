// App Header Component
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Bell, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";

export function AppHeader() {
	const { data: session } = useSession();
	const router = useRouter();
	return (
		<header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
			<div className="flex flex-1 items-center gap-4 md:gap-8">
				{router.pathname == "/dashboard" && (
					<div className="relative w-full max-w-md">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search tickets, customers..."
							className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
						/>
					</div>
				)}
				{router.pathname.includes("chat") && (
					<div className="flex items-center space-x-2 w-full max-w-md">
						<Image
							height={32}
							width={32}
							src="/logo-blue.png"
							alt="Logo"
							className="rounded-full"
						/>
						<span className="text-lg font-bold">Path</span>
					</div>
				)}
			</div>
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" className="relative">
					<Bell className="h-4 w-4" />
					<span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
						4
					</span>
				</Button>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="rounded-full">
							<Image
								src={
									session?.user?.image || "/placeholder.svg?height=32&width=32"
								}
								width={32}
								height={32}
								alt="Avatar"
								className="rounded-full"
							/>
							<span className="sr-only">Toggle user menu</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel className="flex flex-col">
							<span className="text-sm font-medium">My Account</span>
							<span className="text-xs text-muted-foreground">
								{session?.user?.email}
							</span>
						</DropdownMenuLabel>

						<DropdownMenuSeparator />
						<DropdownMenuItem>Profile</DropdownMenuItem>
						<DropdownMenuItem>Settings</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => signOut()}>
							Logout
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}

export default AppHeader;

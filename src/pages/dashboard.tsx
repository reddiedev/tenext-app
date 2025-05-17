"use client";

import * as React from "react";
import { useState, Suspense } from "react";
import {
	Activity,
	ArrowUpDown,
	Bell,
	Clock,
	MoreHorizontal,
	MessageSquare,
	Search,
	ThumbsUp,
	BringToFront,
} from "lucide-react";
import Image from "next/image";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Skeleton } from "~/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { signOut, useSession } from "next-auth/react";
import { auth } from "~/server/auth";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await auth(context);

	if (!session) {
		return {
			redirect: {
				destination: "/sign-in",
				permanent: false,
			},
		};
	}

	if (session.user.role !== "admin") {
		return {
			redirect: {
				destination: "/home",
				permanent: false,
			},
		};
	}

	return {
		props: { session },
	};
};

// Chart Container Components
const ChartContainer = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { config?: any }
>(({ className, config, children, ...props }, ref) => {
	return (
		<div
			className={cn("rounded-md bg-card text-card-foreground", className)}
			ref={ref}
			{...props}
		>
			{children}
		</div>
	);
});
ChartContainer.displayName = "ChartContainer";

const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="rounded-md border bg-background text-foreground p-2 shadow-md">
			{children}
		</div>
	);
};

const ChartTooltipContent = ({ children }: { children: React.ReactNode }) => {
	return <div className="flex flex-col space-y-1 text-sm">{children}</div>;
};

// Dashboard Header Component
function DashboardHeader({
	heading,
	description,
	children,
	className,
}: {
	heading: string;
	description?: string;
	children?: React.ReactNode;
	className?: string;
}) {
	return (
		<div className={cn("flex flex-col gap-1 pb-5", className)}>
			<div className="flex items-center justify-between">
				<div className="grid gap-1">
					<h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
					{description && (
						<p className="text-muted-foreground">{description}</p>
					)}
				</div>
				{children}
			</div>
		</div>
	);
}

// Stats Cards Component
function StatsCards() {
	// Dummy data for stats
	const stats = [
		{
			title: "Total Tickets",
			value: "2,543",
			description: "+12.5% from last month",
			icon: MessageSquare,
		},
		{
			title: "Average Response Time",
			value: "1.2h",
			description: "-8% from last month",
			icon: Clock,
		},
		{
			title: "Resolution Rate",
			value: "92%",
			description: "+3% from last month",
			icon: Activity,
		},
		{
			title: "Customer Satisfaction",
			value: "4.8/5",
			description: "+0.3 from last month",
			icon: ThumbsUp,
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat, index) => (
				<Card key={index}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
						<stat.icon className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stat.value}</div>
						<p className="text-xs text-muted-foreground">{stat.description}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

// Overview Chart Component
function OverviewChart() {
	// Generate dummy data for the past 30 days
	const generateDailyData = () => {
		const data = [];
		const now = new Date();

		for (let i = 29; i >= 0; i--) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);

			// Generate random ticket counts with a realistic pattern
			const base = Math.floor(Math.random() * 20) + 30;
			const weekday = date.getDay();

			// Weekends have fewer tickets
			const modifier = weekday === 0 || weekday === 6 ? 0.6 : 1;

			data.push({
				date: date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				tickets: Math.floor(base * modifier),
			});
		}

		return data;
	};

	const data = generateDailyData();

	function CustomTooltip({ active, payload, label }: any) {
		if (active && payload && payload.length) {
			return (
				<ChartTooltip>
					<ChartTooltipContent>
						<div className="font-medium">{label}</div>
						<div className="flex items-center">
							<div className="w-2 h-2 rounded-full bg-[#8884d8] mr-2" />
							<span>{payload[0].value} tickets</span>
						</div>
					</ChartTooltipContent>
				</ChartTooltip>
			);
		}

		return null;
	}

	return (
		<ChartContainer className="h-[350px]">
			<ResponsiveContainer width="100%" height="100%">
				<AreaChart
					data={data}
					margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
				>
					<defs>
						<linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
							<stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
						</linearGradient>
					</defs>
					<XAxis
						dataKey="date"
						tick={{ fontSize: 12 }}
						tickLine={false}
						axisLine={false}
						tickMargin={10}
					/>
					<YAxis
						tick={{ fontSize: 12 }}
						tickLine={false}
						axisLine={false}
						tickMargin={10}
					/>
					<CartesianGrid strokeDasharray="3 3" vertical={false} />
					<Tooltip content={<CustomTooltip />} />
					<Area
						type="monotone"
						dataKey="tickets"
						stroke="#8884d8"
						fillOpacity={1}
						fill="url(#colorTickets)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</ChartContainer>
	);
}

// Satisfaction Chart Component
function SatisfactionChart() {
	// Dummy data for satisfaction ratings
	const data = [
		{ name: "Very Satisfied", value: 45, color: "#4ade80" },
		{ name: "Satisfied", value: 30, color: "#a3e635" },
		{ name: "Neutral", value: 15, color: "#facc15" },
		{ name: "Dissatisfied", value: 7, color: "#fb923c" },
		{ name: "Very Dissatisfied", value: 3, color: "#f87171" },
	];

	function CustomTooltip({ active, payload }: any) {
		if (active && payload && payload.length) {
			return (
				<ChartTooltip>
					<ChartTooltipContent>
						<div className="font-medium">{payload[0].name}</div>
						<div className="flex items-center">
							<div
								className="w-2 h-2 rounded-full mr-2"
								style={{ backgroundColor: payload[0].payload.color }}
							/>
							<span>{payload[0].value}%</span>
						</div>
					</ChartTooltipContent>
				</ChartTooltip>
			);
		}

		return null;
	}

	return (
		<ChartContainer className="h-[250px]">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={data}
						cx="50%"
						cy="50%"
						labelLine={false}
						outerRadius={80}
						fill="#8884d8"
						dataKey="value"
						label={({ name, percent }: { name: string; percent: number }) =>
							`${name} ${(percent * 100).toFixed(0)}%`
						}
					>
						{data.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.color} />
						))}
					</Pie>
					<Tooltip content={<CustomTooltip />} />
				</PieChart>
			</ResponsiveContainer>
		</ChartContainer>
	);
}

// Tickets By Category Component
function TicketsByCategory() {
	// Dummy data for ticket categories
	const data = [
		{ name: "Technical", value: 35, color: "#8884d8" },
		{ name: "Billing", value: 25, color: "#82ca9d" },
		{ name: "Account", value: 20, color: "#ffc658" },
		{ name: "Product", value: 15, color: "#ff8042" },
		{ name: "Other", value: 5, color: "#0088fe" },
	];

	function CustomTooltip({ active, payload }: any) {
		if (active && payload && payload.length) {
			return (
				<ChartTooltip>
					<ChartTooltipContent>
						<div className="font-medium">{payload[0].name}</div>
						<div className="flex items-center">
							<div
								className="w-2 h-2 rounded-full mr-2"
								style={{ backgroundColor: payload[0].payload.color }}
							/>
							<span>{payload[0].value}%</span>
						</div>
					</ChartTooltipContent>
				</ChartTooltip>
			);
		}

		return null;
	}

	return (
		<ChartContainer className="h-[250px]">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={data}
						cx="50%"
						cy="50%"
						innerRadius={40}
						outerRadius={80}
						fill="#8884d8"
						paddingAngle={2}
						dataKey="value"
					>
						{data.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.color} />
						))}
					</Pie>
					<Tooltip content={<CustomTooltip />} />
					<Legend
						layout="horizontal"
						verticalAlign="bottom"
						align="center"
						formatter={(
							value:
								| string
								| number
								| bigint
								| boolean
								| React.ReactElement<
										unknown,
										string | React.JSXElementConstructor<any>
								  >
								| Iterable<React.ReactNode>
								| React.ReactPortal
								| Promise<
										| string
										| number
										| bigint
										| boolean
										| React.ReactPortal
										| React.ReactElement<
												unknown,
												string | React.JSXElementConstructor<any>
										  >
										| Iterable<React.ReactNode>
										| null
										| undefined
								  >
								| null
								| undefined,
						) => <span className="text-xs">{value}</span>}
					/>
				</PieChart>
			</ResponsiveContainer>
		</ChartContainer>
	);
}

// Response Time Chart Component
function ResponseTimeChart() {
	// Dummy data for response time by day of week
	const data = [
		{ day: "Monday", responseTime: 1.2 },
		{ day: "Tuesday", responseTime: 0.9 },
		{ day: "Wednesday", responseTime: 1.1 },
		{ day: "Thursday", responseTime: 1.3 },
		{ day: "Friday", responseTime: 1.5 },
		{ day: "Saturday", responseTime: 2.1 },
		{ day: "Sunday", responseTime: 2.4 },
	];

	function CustomTooltip({ active, payload, label }: any) {
		if (active && payload && payload.length) {
			return (
				<ChartTooltip>
					<ChartTooltipContent>
						<div className="font-medium">{label}</div>
						<div className="flex items-center">
							<div className="w-2 h-2 rounded-full bg-[#82ca9d] mr-2" />
							<span>{payload[0].value} hours</span>
						</div>
					</ChartTooltipContent>
				</ChartTooltip>
			);
		}

		return null;
	}

	return (
		<ChartContainer className="h-[250px]">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					data={data}
					margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
				>
					<CartesianGrid strokeDasharray="3 3" vertical={false} />
					<XAxis
						dataKey="day"
						tick={{ fontSize: 12 }}
						tickLine={false}
						axisLine={false}
						tickMargin={10}
					/>
					<YAxis
						tick={{ fontSize: 12 }}
						tickLine={false}
						axisLine={false}
						tickMargin={10}
						unit="h"
					/>
					<Tooltip content={<CustomTooltip />} />
					<Bar dataKey="responseTime" fill="#82ca9d" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</ChartContainer>
	);
}

// Recent Tickets Table Component
function RecentTicketsTable() {
	const [sorting, setSorting] = useState({
		column: "created",
		direction: "desc",
	});

	// Dummy data for recent tickets
	const tickets = [
		{
			id: "TICK-1234",
			subject: "Cannot access my account",
			customer: "John Smith",
			status: "Open",
			priority: "High",
			category: "Account",
			created: "2 hours ago",
		},
		{
			id: "TICK-1233",
			subject: "Billing issue with subscription",
			customer: "Sarah Johnson",
			status: "In Progress",
			priority: "Medium",
			category: "Billing",
			created: "3 hours ago",
		},
		{
			id: "TICK-1232",
			subject: "Feature request: Dark mode",
			customer: "Michael Brown",
			status: "Open",
			priority: "Low",
			category: "Product",
			created: "5 hours ago",
		},
		{
			id: "TICK-1231",
			subject: "App crashes on startup",
			customer: "Emily Davis",
			status: "In Progress",
			priority: "High",
			category: "Technical",
			created: "6 hours ago",
		},
		{
			id: "TICK-1230",
			subject: "Cannot update profile picture",
			customer: "David Wilson",
			status: "Resolved",
			priority: "Medium",
			category: "Technical",
			created: "8 hours ago",
		},
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Open":
				return "bg-yellow-500";
			case "In Progress":
				return "bg-blue-500";
			case "Resolved":
				return "bg-green-500";
			default:
				return "bg-gray-500";
		}
	};

	const getPriorityVariant = (priority: string) => {
		switch (priority) {
			case "High":
				return "destructive";
			case "Medium":
				return "default";
			case "Low":
				return "secondary";
			default:
				return "outline";
		}
	};

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-[100px]">Ticket ID</TableHead>
					<TableHead>Subject</TableHead>
					<TableHead>Customer</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Priority</TableHead>
					<TableHead>Category</TableHead>
					<TableHead
						className="cursor-pointer"
						onClick={() =>
							setSorting({
								column: "created",
								direction: sorting.direction === "asc" ? "desc" : "asc",
							})
						}
					>
						<div className="flex items-center">
							Created
							<ArrowUpDown className="ml-2 h-4 w-4" />
						</div>
					</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{tickets.map((ticket) => (
					<TableRow key={ticket.id}>
						<TableCell className="font-medium">{ticket.id}</TableCell>
						<TableCell>{ticket.subject}</TableCell>
						<TableCell>{ticket.customer}</TableCell>
						<TableCell>
							<div className="flex items-center">
								<div
									className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(ticket.status)}`}
								/>
								{ticket.status}
							</div>
						</TableCell>
						<TableCell>
							<Badge variant={getPriorityVariant(ticket.priority) as any}>
								{ticket.priority}
							</Badge>
						</TableCell>
						<TableCell>{ticket.category}</TableCell>
						<TableCell>{ticket.created}</TableCell>
						<TableCell className="text-right">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="h-8 w-8 p-0">
										<span className="sr-only">Open menu</span>
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel>Actions</DropdownMenuLabel>
									<DropdownMenuItem>View details</DropdownMenuItem>
									<DropdownMenuItem>Assign ticket</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem>Change status</DropdownMenuItem>
									<DropdownMenuItem>Change priority</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

// Skeleton Components
function StatsCardsSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{Array(4)
				.fill(0)
				.map((_, i) => (
					<Card key={i}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								<Skeleton className="h-4 w-[120px]" />
							</CardTitle>
							<Skeleton className="h-4 w-4 rounded-full" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-[60px] mb-1" />
							<Skeleton className="h-4 w-[100px]" />
						</CardContent>
					</Card>
				))}
		</div>
	);
}

function ChartSkeleton({ height = "350px" }: { height?: string }) {
	return <Skeleton className={`w-full h-[${height}]`} />;
}

function TableSkeleton() {
	return (
		<div className="space-y-2">
			<Skeleton className="h-8 w-full" />
			{Array(5)
				.fill(0)
				.map((_, i) => (
					<Skeleton key={i} className="h-16 w-full" />
				))}
		</div>
	);
}

// App Header Component
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
						<BringToFront className="size-5 text-muted-foreground" />
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

// Main Dashboard Page Component
export default function Page() {
	const { data: session } = useSession();
	console.log(session);
	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader />
			<main className="flex-1 p-6">
				<DashboardHeader
					heading="Customer Support Dashboard"
					description="Monitor and analyze your customer support performance metrics"
				/>
				<Tabs defaultValue="overview" className="space-y-4">
					<TabsList>
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
						<TabsTrigger value="tickets">Tickets</TabsTrigger>
						<TabsTrigger value="agents">Agents</TabsTrigger>
					</TabsList>
					<TabsContent value="overview" className="space-y-4">
						<Suspense fallback={<StatsCardsSkeleton />}>
							<StatsCards />
						</Suspense>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
							<Card className="lg:col-span-4">
								<CardHeader>
									<CardTitle>Ticket Volume</CardTitle>
									<CardDescription>
										Daily ticket volume over the past 30 days
									</CardDescription>
								</CardHeader>
								<CardContent className="pl-2">
									<Suspense fallback={<ChartSkeleton />}>
										<OverviewChart />
									</Suspense>
								</CardContent>
							</Card>
							<Card className="lg:col-span-3">
								<CardHeader>
									<CardTitle>Customer Satisfaction</CardTitle>
									<CardDescription>
										Satisfaction ratings distribution
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Suspense fallback={<ChartSkeleton height="250px" />}>
										<SatisfactionChart />
									</Suspense>
								</CardContent>
							</Card>
						</div>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
							<Card className="lg:col-span-3">
								<CardHeader>
									<CardTitle>Tickets by Category</CardTitle>
									<CardDescription>
										Distribution of tickets by category
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Suspense fallback={<ChartSkeleton height="250px" />}>
										<TicketsByCategory />
									</Suspense>
								</CardContent>
							</Card>
							<Card className="lg:col-span-4">
								<CardHeader>
									<CardTitle>Response Time</CardTitle>
									<CardDescription>
										Average response time by day of week
									</CardDescription>
								</CardHeader>
								<CardContent className="pl-2">
									<Suspense fallback={<ChartSkeleton />}>
										<ResponseTimeChart />
									</Suspense>
								</CardContent>
							</Card>
						</div>
						<Card>
							<CardHeader>
								<CardTitle>Recent Tickets</CardTitle>
								<CardDescription>
									Recently created and updated support tickets
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Suspense fallback={<TableSkeleton />}>
									<RecentTicketsTable />
								</Suspense>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="analytics" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Analytics</CardTitle>
								<CardDescription>
									Detailed analytics will be displayed here
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[400px] flex items-center justify-center border rounded-md">
									<p className="text-muted-foreground">
										Analytics content coming soon
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="tickets" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>All Tickets</CardTitle>
								<CardDescription>
									Manage and view all support tickets
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[400px] flex items-center justify-center border rounded-md">
									<p className="text-muted-foreground">
										Tickets management coming soon
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
					<TabsContent value="agents" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Support Agents</CardTitle>
								<CardDescription>
									Manage and view agent performance
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="h-[400px] flex items-center justify-center border rounded-md">
									<p className="text-muted-foreground">
										Agent management coming soon
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}

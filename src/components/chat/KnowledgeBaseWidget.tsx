import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
	Link,
	FileText,
	MessageSquare,
	PlusCircle,
	Paperclip,
	Globe,
	FolderPlus,
} from "lucide-react";

interface ResourceItem {
	id: string;
	title: string;
	type: "faq" | "document" | "chat";
	url: string;
}

const KnowledgeBaseWidget = () => {
	// This is just mock data for the UI
	const resources: ResourceItem[] = [
		{
			id: "1",
			title: "How to",
			type: "faq",
			url: "#",
		},
		{
			id: "2",
			title: "API Docs",
			type: "document",
			url: "#",
		},
		{
			id: "3",
			title: "Troubleshoot Guide",
			type: "document",
			url: "#",
		},
		{
			id: "4",
			title: "Prev. Ticket",
			type: "chat",
			url: "#",
		},
		{
			id: "5",
			title: "Fax Receipt",
			type: "document",
			url: "#",
		},
	];

	const getIcon = (type: string) => {
		switch (type) {
			case "faq":
				return <Link className="text-blue-500" />;
			case "document":
				return <FileText className="text-emerald-500" />;
			case "chat":
				return <MessageSquare className="text-purple-500" />;
			default:
				return <Link className="text-gray-500" />;
		}
	};

	return (
		<Card className="w-80 shadow-md gap-0 p-4">
			<CardContent className="p-0 pb-1">
				<ul className="flex flex-wrap text-[4px] gap-1">
					{resources.map((resource) => (
						<li key={resource.id}>
							<Button
								variant="outline"
								className="flex items-center gap-1 p-0 h-auto rounded-md hover:bg-muted transition-colors"
							>
								{getIcon(resource.type)}
								<span>{resource.title}</span>
							</Button>
						</li>
					))}
				</ul>
			</CardContent>
			<CardFooter className="flex justify-between border-t p-0 mt-1">
				<div className="flex gap-1 flex-wrap">
					<Button variant="outline" size="sm" className="h-auto p-0">
						<Paperclip className="h-4 w-4" />
					</Button>
					<Button variant="outline" size="sm">
						<Globe className="h-4 w-4" />
					</Button>
					<Button variant="outline" size="sm">
						<FolderPlus className="h-4 w-4" />
					</Button>
				</div>
				<Button size="sm" className="gap-1">
					<PlusCircle className="h-4 w-4" />
					Add Resource
				</Button>
			</CardFooter>
		</Card>
	);
};

export default KnowledgeBaseWidget;

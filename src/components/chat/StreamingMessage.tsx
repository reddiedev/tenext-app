import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import { MarkdownContent } from "./MarkdownContent";

interface StreamingMessageProps {
	content: string;
}

export function StreamingMessage({ content }: StreamingMessageProps) {
	return (
		<div className="flex gap-2">
			<Avatar className="h-8 w-8">
				<AvatarImage
					src="/placeholder.svg?height=32&width=32&query=A"
					alt="Agent"
				/>
				<AvatarFallback>A</AvatarFallback>
			</Avatar>
			<div className="flex flex-col">
				<Card className="max-w-3xl bg-muted py-0">
					<CardContent className="px-3 py-2">
						<MarkdownContent content={content} />
					</CardContent>
				</Card>
				<span className="mt-1 text-xs text-muted-foreground">Typing...</span>
			</div>
		</div>
	);
}

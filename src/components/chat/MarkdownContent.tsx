import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "~/lib/utils";

interface MarkdownContentProps {
	content: string;
	className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
	return (
		<div className={cn("prose dark:prose-invert max-w-none", className)}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw, rehypeSanitize]}
				components={{
					// Override default element styling
					p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
					a: ({ href, children }) => (
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							{children}
						</a>
					),
					ul: ({ children }) => (
						<ul className="mb-2 list-disc pl-4">{children}</ul>
					),
					ol: ({ children }) => (
						<ol className="mb-2 list-decimal pl-4">{children}</ol>
					),
					li: ({ children }) => <li className="mb-1">{children}</li>,
					code: ({ node, className, children, ...props }) => (
						<code
							className={cn(
								"rounded bg-muted px-1 py-0.5 font-mono text-sm",
								"block p-2 overflow-x-auto whitespace-pre-wrap break-words",
								className,
							)}
							{...props}
						>
							{children}
						</code>
					),
					pre: ({ children }) => (
						<pre className="mb-2 overflow-x-auto rounded bg-muted p-2 whitespace-pre-wrap break-words">
							{children}
						</pre>
					),
					blockquote: ({ children }) => (
						<blockquote className="mb-2 border-l-2 border-primary pl-4 italic">
							{children}
						</blockquote>
					),
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}

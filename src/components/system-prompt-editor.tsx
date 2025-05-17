import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
	systemPrompt: z.string().min(10, {
		message: "System prompt must be at least 10 characters.",
	}),
});

type FormValues = z.infer<typeof formSchema>;

const defaultSystemPrompt = `You are Path, an AI assistant focused on providing empathetic customer service. 
Your responses should be helpful, accurate, and express understanding of the customer's situation and feelings.
Always offer actionable solutions when possible and maintain a supportive tone.`;

export function SystemPromptEditor() {
	// Define form with react-hook-form
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			systemPrompt: defaultSystemPrompt,
		},
	});

	// Simplified submit handler (no actual logic as requested)
	function onSubmit(data: FormValues) {
		console.log("System prompt updated:", data);
		// In a real implementation, this would save the prompt to your backend
	}

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Edit System Prompt</CardTitle>
				<CardDescription>
					Customize the AI assistant's behavior by modifying the system prompt.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="systemPrompt"
							render={({ field }) => (
								<FormItem>
									<FormLabel>System Prompt</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter system prompt..."
											className="min-h-[200px] resize-y"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										The system prompt defines how the AI assistant behaves and
										responds.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit">Save Changes</Button>
					</form>
				</Form>
			</CardContent>
			<CardFooter className="flex justify-between border-t pt-4">
				<Button variant="outline" onClick={() => form.reset()}>
					Reset to Default
				</Button>
				<Button
					variant="ghost"
					onClick={() => form.reset({ systemPrompt: "" })}
				>
					Clear
				</Button>
			</CardFooter>
		</Card>
	);
}

export default SystemPromptEditor;

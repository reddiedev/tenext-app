import { zodResolver } from "@hookform/resolvers/zod";
import { BuildingIcon, CheckIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import * as z from "zod";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

// Define the form validation schema for signin
const formSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address.",
	}),
	password: z.string().min(8, {
		message: "Password must be at least 8 characters.",
	}),
});

export function SigninForm() {
	const { data: session } = useSession();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const router = useRouter();
	// Initialize the form
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "user@tenext.ai",
			password: "password",
		},
	});

	// Handle form submission
	async function onSubmit(values: z.infer<typeof formSchema>) {
		setIsSubmitting(true);

		toast.loading("Signing in...");

		const result = await signIn("credentials", {
			email: values.email,
			password: values.password,
			redirect: false,
		});

		if (!result) {
			toast.error("Failed to sign in");
			setIsSubmitting(false);
			return;
		}

		if (result.error) {
			console.error(result.error);
			toast.error(result.error || "Failed to sign in");
			setIsSubmitting(false);
			return;
		}

		toast.success("Signed in successfully");
		setIsSuccess(true);
		setIsSubmitting(false);

		toast.loading("Redirecting to dashboard...");

		// Optionally, redirect after sign in
		setTimeout(() => {
			toast.dismiss();
			router.push("/dashboard");
		}, 2 * 1000);
	}

	return (
		<Card className="mx-auto w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl">Sign in to your account</CardTitle>
				<CardDescription>
					Enter your email and password to sign in
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col">
				{isSuccess ? (
					<div className="flex flex-col items-center justify-center space-y-2 py-6 text-center">
						<div className="rounded-full bg-green-100 p-3">
							<CheckIcon className="h-6 w-6 text-green-600" />
						</div>
						<h3 className="font-medium text-lg">Signed in successfully!</h3>
						<p className="text-muted-foreground text-sm">
							You have been signed in.
						</p>
						{/* Optionally, add a redirect or dashboard link */}
					</div>
				) : (
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								disabled
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type="email"
												placeholder="john.doe@example.com"
												disabled
												className="disabled:cursor-not-allowed"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="password"
								disabled
								render={({ field }) => (
									<FormItem className="disabled:cursor-not-allowed">
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="********"
												disabled
												className="disabled:cursor-not-allowed"
												{...field}
											/>
										</FormControl>
										<FormDescription>
											Must be at least 8 characters
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button className="w-full" disabled={true}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Signing in...
									</>
								) : (
									"Sign in"
								)}
							</Button>
						</form>
					</Form>
				)}

				<div className="flex flex-col gap-2 space-y-2">
					<Separator className="w-full mt-4" />

					<Button
						onClick={async () => {
							await signIn("google", {
								callbackUrl: "https://path.reddie.dev/chats",
							});
						}}
						variant="outline"
						className="w-full"
					>
						<FcGoogle className="mr-2 h-4 w-4" />
						Sign in with Google
					</Button>

					<Button variant="outline" className="w-full" disabled>
						<BuildingIcon className="mr-2 h-4 w-4" />
						Sign in with SSO
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export default function Page() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
			<SigninForm />
		</main>
	);
}
